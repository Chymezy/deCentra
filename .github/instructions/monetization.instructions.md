---
applyTo: "**"
---

# Creator Monetization Features

## ICP Token Integration

### Micro-Tipping System

```rust
// ICP micro-tipping for content creators
use ic_cdk::api::management_canister::provisional::CanisterSettings;
use candid::Nat;

// Tip structure with social context
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ContentTip {
    pub id: TipId,
    pub tipper_id: UserId,
    pub recipient_id: UserId,
    pub content_id: ContentId,
    pub amount: u64,          // ICP amount in e8s (1 ICP = 100,000,000 e8s)
    pub message: Option<String>,
    pub tip_type: TipType,
    pub transaction_hash: String,
    pub created_at: u64,
    pub processing_status: TipStatus,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TipType {
    PostAppreciation,         // Regular post tip
    QualityContent,          // High-quality content reward
    WhistleblowerSupport,    // Support for whistleblowing
    CreatorSupport,          // General creator support
    MilestoneReward,         // Achievement-based tip
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TipStatus {
    Pending,
    Processing,
    Completed,
    Failed(String),
    Refunded,
}

// Creator subscription system
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreatorSubscription {
    pub creator_id: UserId,
    pub subscriber_id: UserId,
    pub tier: SubscriptionTier,
    pub monthly_amount: u64,  // ICP e8s per month
    pub started_at: u64,
    pub next_payment: u64,
    pub status: SubscriptionStatus,
    pub benefits: Vec<SubscriptionBenefit>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SubscriptionTier {
    Basic(u64),               // Basic tier with amount
    Premium(u64),             // Premium tier with amount  
    Supporter(u64),           // Supporter tier with amount
    Custom(u64, String),      // Custom tier with description
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SubscriptionBenefit {
    ExclusiveContent,
    EarlyAccess,
    DirectMessaging,
    PrioritySupport,
    BehindTheScenes,
    Custom(String),
}

// Tip processing with social network integration
#[ic_cdk::update]
pub async fn tip_content(
    content_id: ContentId,
    amount: u64,
    message: Option<String>,
    tip_type: TipType
) -> Result<TipId, String> {
    let tipper_id = authenticate_user()?;
    
    // Validate tip amount
    if amount < MIN_TIP_AMOUNT {
        return Err(format!("Minimum tip amount is {} e8s", MIN_TIP_AMOUNT));
    }
    
    if amount > MAX_TIP_AMOUNT {
        return Err(format!("Maximum tip amount is {} e8s", MAX_TIP_AMOUNT));
    }
    
    // Get content and creator
    let content = get_content(&content_id)?;
    let creator_id = content.author_id;
    
    // Prevent self-tipping
    if tipper_id == creator_id {
        return Err("Cannot tip your own content".into());
    }
    
    // Check tipper's balance
    let tipper_balance = get_user_icp_balance(&tipper_id)?;
    if tipper_balance < amount {
        return Err("Insufficient ICP balance".into());
    }
    
    // Create tip record
    let tip_id = TipId(generate_tip_id());
    let tip = ContentTip {
        id: tip_id.clone(),
        tipper_id: tipper_id.clone(),
        recipient_id: creator_id.clone(),
        content_id,
        amount,
        message,
        tip_type,
        transaction_hash: String::new(), // Will be set after transfer
        created_at: ic_cdk::api::time(),
        processing_status: TipStatus::Pending,
    };
    
    // Process ICP transfer
    let transaction_result = transfer_icp_with_fee(
        tipper_id.clone(),
        creator_id.clone(),
        amount
    ).await?;
    
    // Update tip with transaction details
    let updated_tip = ContentTip {
        transaction_hash: transaction_result.transaction_hash,
        processing_status: TipStatus::Completed,
        ..tip
    };
    
    // Store tip and update metrics
    with_state_mut(|state| {
        state.content_tips.insert(tip_id.clone(), updated_tip.clone());
        
        // Update content tip metrics
        if let Some(content) = state.posts.get_mut(&content_id.into()) {
            content.tips_received += amount;
            content.tip_count += 1;
        }
        
        // Update user tip metrics
        if let Some(creator) = state.users.get_mut(&creator_id) {
            creator.total_tips_received += amount;
            creator.tip_count += 1;
        }
        
        if let Some(tipper) = state.users.get_mut(&tipper_id) {
            tipper.total_tips_given += amount;
        }
        
        // Create notification for creator
        let notification = Notification {
            id: NotificationId(generate_notification_id()),
            recipient_id: creator_id,
            notification_type: NotificationType::TipReceived {
                tipper: tipper_id,
                amount,
                content_id: content_id.into(),
                message: updated_tip.message.clone(),
            },
            created_at: ic_cdk::api::time(),
            read_at: None,
        };
        
        state.notifications.insert(notification.id.clone(), notification);
        
        Ok(tip_id)
    })
}

// ICP transfer implementation
async fn transfer_icp_with_fee(
    from: UserId,
    to: UserId,
    amount: u64
) -> Result<TransferResult, String> {
    // Calculate fee (platform takes small percentage)
    let platform_fee = calculate_platform_fee(amount);
    let creator_amount = amount - platform_fee;
    
    // Transfer to creator
    let creator_transfer = ic_ledger_types::TransferArgs {
        memo: ic_ledger_types::Memo(0),
        amount: ic_ledger_types::Tokens::from_e8s(creator_amount),
        fee: ic_ledger_types::DEFAULT_FEE,
        from_subaccount: Some(user_id_to_subaccount(&from)),
        to: ic_ledger_types::AccountIdentifier::new(&to.0, None),
        created_at_time: Some(ic_cdk::api::time()),
    };
    
    let creator_result = ic_ledger_types::transfer(creator_transfer).await
        .map_err(|e| format!("Transfer failed: {:?}", e))?
        .map_err(|e| format!("Transfer error: {:?}", e))?;
    
    // Transfer platform fee
    let platform_transfer = ic_ledger_types::TransferArgs {
        memo: ic_ledger_types::Memo(1), // Platform fee memo
        amount: ic_ledger_types::Tokens::from_e8s(platform_fee),
        fee: ic_ledger_types::DEFAULT_FEE,
        from_subaccount: Some(user_id_to_subaccount(&from)),
        to: ic_ledger_types::AccountIdentifier::new(&get_platform_principal(), None),
        created_at_time: Some(ic_cdk::api::time()),
    };
    
    let _platform_result = ic_ledger_types::transfer(platform_transfer).await
        .map_err(|e| format!("Platform fee transfer failed: {:?}", e))?
        .map_err(|e| format!("Platform fee error: {:?}", e))?;
    
    Ok(TransferResult {
        transaction_hash: format!("{:?}", creator_result),
        creator_amount,
        platform_fee,
        total_amount: amount,
    })
}

// Subscription management
#[ic_cdk::update]
pub async fn subscribe_to_creator(
    creator_id: UserId,
    tier: SubscriptionTier,
    duration_months: u8
) -> Result<SubscriptionId, String> {
    let subscriber_id = authenticate_user()?;
    
    if subscriber_id == creator_id {
        return Err("Cannot subscribe to yourself".into());
    }
    
    // Check if creator offers subscriptions
    let creator = get_user_profile(&creator_id)?;
    if !creator.creator_profile.is_some() {
        return Err("User is not a creator".into());
    }
    
    let creator_profile = creator.creator_profile.unwrap();
    if !creator_profile.subscriptions_enabled {
        return Err("Creator does not offer subscriptions".into());
    }
    
    // Validate subscription tier
    let monthly_amount = match &tier {
        SubscriptionTier::Basic(amount) => *amount,
        SubscriptionTier::Premium(amount) => *amount,
        SubscriptionTier::Supporter(amount) => *amount,
        SubscriptionTier::Custom(amount, _) => *amount,
    };
    
    if monthly_amount < MIN_SUBSCRIPTION_AMOUNT {
        return Err("Subscription amount too low".into());
    }
    
    // Calculate total cost
    let total_cost = monthly_amount * duration_months as u64;
    
    // Check subscriber balance
    let subscriber_balance = get_user_icp_balance(&subscriber_id)?;
    if subscriber_balance < total_cost {
        return Err("Insufficient balance for subscription".into());
    }
    
    // Create subscription
    let subscription_id = SubscriptionId(generate_subscription_id());
    let subscription = CreatorSubscription {
        creator_id: creator_id.clone(),
        subscriber_id: subscriber_id.clone(),
        tier,
        monthly_amount,
        started_at: ic_cdk::api::time(),
        next_payment: ic_cdk::api::time() + (30 * 24 * 60 * 60 * 1_000_000_000), // 30 days
        status: SubscriptionStatus::Active,
        benefits: get_tier_benefits(&tier),
    };
    
    // Process initial payment
    let transfer_result = transfer_icp_with_fee(
        subscriber_id.clone(),
        creator_id.clone(),
        monthly_amount
    ).await?;
    
    // Store subscription
    with_state_mut(|state| {
        state.creator_subscriptions.insert(subscription_id.clone(), subscription.clone());
        
        // Update creator metrics
        if let Some(creator) = state.users.get_mut(&creator_id) {
            creator.subscriber_count += 1;
            creator.monthly_recurring_revenue += monthly_amount;
        }
        
        // Create notification
        let notification = Notification {
            id: NotificationId(generate_notification_id()),
            recipient_id: creator_id,
            notification_type: NotificationType::NewSubscriber {
                subscriber: subscriber_id,
                tier: subscription.tier.clone(),
                amount: monthly_amount,
            },
            created_at: ic_cdk::api::time(),
            read_at: None,
        };
        
        state.notifications.insert(notification.id.clone(), notification);
        
        Ok(subscription_id)
    })
}
```

## Analytics & Insights

### Creator Dashboard Analytics

```rust
// Comprehensive analytics for creators
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreatorAnalytics {
    pub user_id: UserId,
    pub period: AnalyticsPeriod,
    pub engagement_metrics: EngagementAnalytics,
    pub revenue_metrics: RevenueAnalytics,
    pub audience_metrics: AudienceAnalytics,
    pub content_performance: Vec<ContentAnalytics>,
    pub growth_metrics: GrowthAnalytics,
    pub generated_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum AnalyticsPeriod {
    Last7Days,
    Last30Days,
    Last90Days,
    LastYear,
    AllTime,
    Custom(u64, u64), // start_time, end_time
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct EngagementAnalytics {
    pub total_likes: u64,
    pub total_comments: u64,
    pub total_reposts: u64,
    pub total_tips: u64,
    pub total_tip_amount: u64,
    pub engagement_rate: f64,
    pub avg_engagement_per_post: f64,
    pub top_performing_content: Vec<ContentId>,
    pub engagement_by_day: Vec<DailyEngagement>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct RevenueAnalytics {
    pub total_tips_received: u64,
    pub total_subscription_revenue: u64,
    pub total_revenue: u64,
    pub revenue_by_source: RevenueBreakdown,
    pub revenue_by_day: Vec<DailyRevenue>,
    pub top_supporters: Vec<SupporterAnalytics>,
    pub monthly_recurring_revenue: u64,
    pub revenue_growth_rate: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct AudienceAnalytics {
    pub total_followers: u64,
    pub total_subscribers: u64,
    pub follower_growth_rate: f64,
    pub audience_engagement_score: f64,
    pub top_supporter_countries: Vec<CountryStats>,
    pub audience_activity_hours: Vec<HourlyActivity>,
    pub subscriber_retention_rate: f64,
}

// Analytics calculation system
pub struct AnalyticsEngine;

impl AnalyticsEngine {
    pub fn generate_creator_analytics(
        creator_id: &UserId,
        period: AnalyticsPeriod
    ) -> Result<CreatorAnalytics, String> {
        let (start_time, end_time) = Self::get_period_bounds(&period);
        
        with_state(|state| {
            // Calculate engagement metrics
            let engagement_metrics = Self::calculate_engagement_metrics(
                creator_id, 
                start_time, 
                end_time, 
                state
            )?;
            
            // Calculate revenue metrics
            let revenue_metrics = Self::calculate_revenue_metrics(
                creator_id, 
                start_time, 
                end_time, 
                state
            )?;
            
            // Calculate audience metrics
            let audience_metrics = Self::calculate_audience_metrics(
                creator_id, 
                start_time, 
                end_time, 
                state
            )?;
            
            // Calculate content performance
            let content_performance = Self::calculate_content_performance(
                creator_id, 
                start_time, 
                end_time, 
                state
            )?;
            
            // Calculate growth metrics
            let growth_metrics = Self::calculate_growth_metrics(
                creator_id, 
                start_time, 
                end_time, 
                state
            )?;
            
            Ok(CreatorAnalytics {
                user_id: creator_id.clone(),
                period,
                engagement_metrics,
                revenue_metrics,
                audience_metrics,
                content_performance,
                growth_metrics,
                generated_at: ic_cdk::api::time(),
            })
        })
    }
    
    fn calculate_engagement_metrics(
        creator_id: &UserId,
        start_time: u64,
        end_time: u64,
        state: &SocialNetworkState
    ) -> Result<EngagementAnalytics, String> {
        let creator_posts: Vec<&Post> = state.posts.values()
            .filter(|post| {
                post.author_id == *creator_id &&
                post.created_at >= start_time &&
                post.created_at <= end_time
            })
            .collect();
        
        let total_likes = creator_posts.iter().map(|p| p.likes_count).sum();
        let total_comments = creator_posts.iter().map(|p| p.comments_count).sum();
        let total_reposts = creator_posts.iter().map(|p| p.reposts_count).sum();
        let total_tips = creator_posts.iter().map(|p| p.tip_count).sum();
        let total_tip_amount = creator_posts.iter().map(|p| p.tips_received).sum();
        
        let total_followers = state.followers.get(creator_id)
            .map(|f| f.len() as u64)
            .unwrap_or(0);
        
        let total_engagement = total_likes + total_comments + total_reposts;
        let engagement_rate = if total_followers > 0 {
            (total_engagement as f64) / (total_followers as f64) * 100.0
        } else {
            0.0
        };
        
        let avg_engagement_per_post = if !creator_posts.is_empty() {
            (total_engagement as f64) / (creator_posts.len() as f64)
        } else {
            0.0
        };
        
        // Find top performing content
        let mut post_performance: Vec<(ContentId, u64)> = creator_posts.iter()
            .map(|post| (ContentId::Post(post.id.clone()), post.engagement_score()))
            .collect();
        post_performance.sort_by(|a, b| b.1.cmp(&a.1));
        let top_performing_content = post_performance.into_iter()
            .take(10)
            .map(|(id, _)| id)
            .collect();
        
        // Calculate daily engagement
        let engagement_by_day = Self::calculate_daily_engagement(
            &creator_posts, 
            start_time, 
            end_time
        );
        
        Ok(EngagementAnalytics {
            total_likes,
            total_comments,
            total_reposts,
            total_tips,
            total_tip_amount,
            engagement_rate,
            avg_engagement_per_post,
            top_performing_content,
            engagement_by_day,
        })
    }
    
    fn calculate_revenue_metrics(
        creator_id: &UserId,
        start_time: u64,
        end_time: u64,
        state: &SocialNetworkState
    ) -> Result<RevenueAnalytics, String> {
        // Calculate tip revenue
        let tips_in_period: Vec<&ContentTip> = state.content_tips.values()
            .filter(|tip| {
                tip.recipient_id == *creator_id &&
                tip.created_at >= start_time &&
                tip.created_at <= end_time &&
                matches!(tip.processing_status, TipStatus::Completed)
            })
            .collect();
        
        let total_tips_received = tips_in_period.iter()
            .map(|tip| tip.amount)
            .sum();
        
        // Calculate subscription revenue
        let subscriptions_in_period: Vec<&CreatorSubscription> = state.creator_subscriptions.values()
            .filter(|sub| {
                sub.creator_id == *creator_id &&
                sub.started_at >= start_time &&
                matches!(sub.status, SubscriptionStatus::Active)
            })
            .collect();
        
        let total_subscription_revenue = subscriptions_in_period.iter()
            .map(|sub| sub.monthly_amount)
            .sum();
        
        let total_revenue = total_tips_received + total_subscription_revenue;
        
        // Revenue breakdown
        let revenue_by_source = RevenueBreakdown {
            tips: total_tips_received,
            subscriptions: total_subscription_revenue,
            other: 0, // For future revenue streams
        };
        
        // Daily revenue calculation
        let revenue_by_day = Self::calculate_daily_revenue(
            &tips_in_period,
            &subscriptions_in_period,
            start_time,
            end_time
        );
        
        // Top supporters
        let top_supporters = Self::calculate_top_supporters(&tips_in_period);
        
        // MRR calculation
        let monthly_recurring_revenue = subscriptions_in_period.iter()
            .map(|sub| sub.monthly_amount)
            .sum();
        
        // Revenue growth rate (compared to previous period)
        let revenue_growth_rate = Self::calculate_revenue_growth_rate(
            creator_id,
            start_time,
            end_time,
            state
        );
        
        Ok(RevenueAnalytics {
            total_tips_received,
            total_subscription_revenue,
            total_revenue,
            revenue_by_source,
            revenue_by_day,
            top_supporters,
            monthly_recurring_revenue,
            revenue_growth_rate,
        })
    }
}

// Creator payout system
#[ic_cdk::update]
pub async fn request_creator_payout(
    amount: u64,
    payout_method: PayoutMethod
) -> Result<PayoutId, String> {
    let creator_id = authenticate_user()?;
    
    // Validate creator status
    let creator = get_user_profile(&creator_id)?;
    if creator.creator_profile.is_none() {
        return Err("Not a verified creator".into());
    }
    
    // Check minimum payout amount
    if amount < MIN_PAYOUT_AMOUNT {
        return Err(format!("Minimum payout amount is {} e8s", MIN_PAYOUT_AMOUNT));
    }
    
    // Check available balance
    let creator_balance = get_creator_balance(&creator_id)?;
    if creator_balance < amount {
        return Err("Insufficient balance for payout".into());
    }
    
    // Create payout request
    let payout_id = PayoutId(generate_payout_id());
    let payout_request = CreatorPayout {
        id: payout_id.clone(),
        creator_id: creator_id.clone(),
        amount,
        payout_method,
        status: PayoutStatus::Pending,
        created_at: ic_cdk::api::time(),
        processed_at: None,
        transaction_hash: None,
    };
    
    // Store payout request
    with_state_mut(|state| {
        state.creator_payouts.insert(payout_id.clone(), payout_request);
        
        // Update creator balance (reserve the amount)
        if let Some(creator) = state.users.get_mut(&creator_id) {
            creator.available_balance -= amount;
            creator.pending_payouts += amount;
        }
        
        Ok(payout_id)
    })
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PayoutMethod {
    ICPTransfer(String),      // ICP wallet address
    BankTransfer(BankDetails), // Traditional bank transfer
    CryptoWallet(CryptoWalletDetails), // Other crypto wallets
}
```

### Frontend Creator Dashboard

```typescript
// Creator monetization dashboard
export function CreatorDashboard() {
  const { authState } = useAuth();
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('last30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authState.userProfile?.creatorProfile) {
      loadAnalytics();
    }
  }, [authState.userProfile, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await CreatorService.getAnalytics(selectedPeriod);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!authState.userProfile?.creatorProfile) {
    return <CreatorOnboarding />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor your content performance and revenue on deCentra
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <PeriodSelector
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            options={[
              { value: 'last7days', label: 'Last 7 Days' },
              { value: 'last30days', label: 'Last 30 Days' },
              { value: 'last90days', label: 'Last 90 Days' },
              { value: 'lastyear', label: 'Last Year' },
              { value: 'alltime', label: 'All Time' },
            ]}
          />
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={formatICP(analytics.revenueMetrics.totalRevenue)}
                icon={<CurrencyDollarIcon className="h-6 w-6" />}
                trend={analytics.revenueMetrics.revenueGrowthRate}
              />
              <MetricCard
                title="Monthly Recurring Revenue"
                value={formatICP(analytics.revenueMetrics.monthlyRecurringRevenue)}
                icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
              />
              <MetricCard
                title="Total Followers"
                value={formatNumber(analytics.audienceMetrics.totalFollowers)}
                icon={<UsersIcon className="h-6 w-6" />}
                trend={analytics.audienceMetrics.followerGrowthRate}
              />
              <MetricCard
                title="Engagement Rate"
                value={`${analytics.engagementMetrics.engagementRate.toFixed(1)}%`}
                icon={<HeartIcon className="h-6 w-6" />}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RevenueChart data={analytics.revenueMetrics.revenueByDay} />
              <EngagementChart data={analytics.engagementMetrics.engagementByDay} />
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <RevenueBreakdownCard revenue={analytics.revenueMetrics} />
              <TopSupportersCard supporters={analytics.revenueMetrics.topSupporters} />
              <ContentPerformanceCard content={analytics.contentPerformance} />
            </div>

            {/* Audience Insights */}
            <AudienceInsightsCard analytics={analytics.audienceMetrics} />

            {/* Payout Section */}
            <CreatorPayoutSection />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Revenue chart component
function RevenueChart({ data }: { data: DailyRevenue[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => formatShortDate(date)}
          />
          <YAxis tickFormatter={(value) => formatICP(value)} />
          <Tooltip 
            labelFormatter={(date) => formatFullDate(date)}
            formatter={(value: number) => [formatICP(value), 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="totalRevenue" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Creator payout component
function CreatorPayoutSection() {
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('icp');
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingPayouts, setPendingPayouts] = useState<CreatorPayout[]>([]);

  useEffect(() => {
    loadPayoutData();
  }, []);

  const loadPayoutData = async () => {
    try {
      const [balance, payouts] = await Promise.all([
        CreatorService.getAvailableBalance(),
        CreatorService.getPendingPayouts(),
      ]);
      setAvailableBalance(balance);
      setPendingPayouts(payouts);
    } catch (error) {
      console.error('Failed to load payout data:', error);
    }
  };

  const handlePayout = async () => {
    try {
      const amount = parseFloat(payoutAmount);
      if (amount <= 0 || amount > availableBalance) {
        throw new Error('Invalid payout amount');
      }

      await CreatorService.requestPayout(amount * 100000000, payoutMethod); // Convert to e8s
      await loadPayoutData();
      setPayoutAmount('');
    } catch (error) {
      console.error('Payout request failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance & Request Payout */}
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">
              {formatICP(availableBalance)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payout Amount (ICP)
              </label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                max={availableBalance / 100000000}
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payout Method
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as PayoutMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="icp">ICP Transfer</option>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Crypto Wallet</option>
              </select>
            </div>

            <button
              onClick={handlePayout}
              disabled={!payoutAmount || parseFloat(payoutAmount) <= 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Pending Payouts */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Pending Payouts</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingPayouts.length > 0 ? (
              pendingPayouts.map((payout) => (
                <div key={payout.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{formatICP(payout.amount)}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(payout.createdAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    payout.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : payout.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payout.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No pending payouts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Remember: Creator monetization features should empower content creators with direct revenue streams while maintaining the decentralized, censorship-resistant nature of deCentra. All financial transactions are transparent and recorded on-chain.