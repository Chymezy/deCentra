---
applyTo: "**"
---

# Content Moderation Instructions

## DAO-Based Moderation System

### Community-Driven Content Governance

```rust
// DAO-based moderation for deCentra
use ic_cdk::api::management_canister::main::raw_rand;

// Moderation proposal system
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ModerationProposal {
    pub id: ProposalId,
    pub content_reference: ContentReference,
    pub proposed_action: ModerationAction,
    pub reasoning: String,
    pub proposer_id: UserId,
    pub created_at: u64,
    pub voting_deadline: u64,
    pub votes: VoteTracker,
    pub status: ProposalStatus,
    pub evidence: Vec<EvidenceItem>,
    pub community_guidelines_violated: Vec<GuidelineViolation>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ModerationAction {
    NoAction,                          // Content is acceptable
    AddWarningLabel(String),           // Add content warning
    RestrictVisibility,                // Limit to followers only
    RequireContentWarning,             // Force content warning
    ShadowBan(u64),                   // Reduce visibility for duration
    TemporarySuspension(u64),         // Suspend user temporarily
    ContentRemoval(String),           // Remove with reason
    AccountTermination(String),       // Permanent ban with reason
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ProposalStatus {
    Open,                             // Currently accepting votes
    Voting,                           // In voting phase
    Approved(ModerationAction),       // Community approved action
    Rejected,                         // Community rejected proposal
    Executed,                         // Action has been carried out
    Appealed(AppealId),              // Under appeal process
    Expired,                         // Voting deadline passed
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct VoteTracker {
    pub votes_for: u64,
    pub votes_against: u64,
    pub votes_abstain: u64,
    pub total_voting_power: u64,
    pub voters: Vec<VoterRecord>,
    pub participation_rate: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct VoterRecord {
    pub voter_id: UserId,
    pub vote: Vote,
    pub voting_power: u64,
    pub reasoning: Option<String>,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum Vote {
    For,
    Against,
    Abstain,
}

// Content reporting system
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ContentReport {
    pub id: ReportId,
    pub reporter_id: UserId,
    pub content_reference: ContentReference,
    pub report_category: ReportCategory,
    pub severity: ReportSeverity,
    pub description: String,
    pub evidence_urls: Vec<String>,
    pub status: ReportStatus,
    pub created_at: u64,
    pub moderator_notes: Vec<ModeratorNote>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ReportCategory {
    Spam,                             // Unwanted bulk content
    Harassment,                       // Targeted abuse
    Misinformation,                   // False information
    Violence,                         // Violent content
    SelfHarm,                        // Self-harm content
    Copyright,                        // Copyright violation
    Privacy,                         // Privacy violation
    AdultContent,                    // Adult/NSFW content
    HateSpeech,                      // Hate speech
    Scam,                            // Fraudulent content
    Other(String),                   // Custom category
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ReportSeverity {
    Low,                             // Minor issue
    Medium,                          // Moderate concern
    High,                           // Serious violation
    Critical,                       // Immediate action required
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ReportStatus {
    Pending,                         // Awaiting review
    UnderReview,                     // Being investigated
    EscalatedToDAO,                  // Escalated for community vote
    Resolved(ModerationAction),      // Action taken
    Dismissed(String),               // No action needed
    Duplicate(ReportId),             // Duplicate of another report
}

// DAO moderation implementation
pub struct DAOModerationSystem;

impl DAOModerationSystem {
    /// Submit a content moderation proposal to the DAO
    #[ic_cdk::update]
    pub async fn submit_moderation_proposal(
        content_ref: ContentReference,
        proposed_action: ModerationAction,
        reasoning: String,
        evidence: Vec<EvidenceItem>
    ) -> Result<ProposalId, String> {
        let proposer_id = authenticate_user()?;
        
        // Validate proposer has moderation privileges
        if !has_moderation_privileges(&proposer_id)? {
            return Err("Insufficient privileges to propose moderation".into());
        }
        
        // Validate content exists
        validate_content_exists(&content_ref)?;
        
        // Check for duplicate proposals
        if has_active_proposal_for_content(&content_ref)? {
            return Err("Active moderation proposal already exists for this content".into());
        }
        
        // Generate proposal ID
        let proposal_id = ProposalId(generate_proposal_id());
        
        // Create proposal
        let proposal = ModerationProposal {
            id: proposal_id.clone(),
            content_reference: content_ref.clone(),
            proposed_action,
            reasoning,
            proposer_id: proposer_id.clone(),
            created_at: ic_cdk::api::time(),
            voting_deadline: ic_cdk::api::time() + VOTING_PERIOD_DURATION,
            votes: VoteTracker::new(),
            status: ProposalStatus::Open,
            evidence,
            community_guidelines_violated: analyze_guideline_violations(&content_ref)?,
        };
        
        // Store proposal
        with_state_mut(|state| {
            state.moderation_proposals.insert(proposal_id.clone(), proposal.clone());
            
            // Notify eligible voters
            notify_dao_members_of_proposal(&proposal_id)?;
            
            // Create audit entry
            let audit_entry = ModerationAuditEntry {
                action: ModerationAuditAction::ProposalSubmitted,
                proposal_id: Some(proposal_id.clone()),
                actor_id: proposer_id,
                timestamp: ic_cdk::api::time(),
                details: format!("Moderation proposal submitted for {:?}", content_ref),
            };
            state.moderation_audit_log.push(audit_entry);
            
            Ok(proposal_id)
        })
    }
    
    /// Vote on a moderation proposal
    #[ic_cdk::update]
    pub async fn vote_on_proposal(
        proposal_id: ProposalId,
        vote: Vote,
        reasoning: Option<String>
    ) -> Result<(), String> {
        let voter_id = authenticate_user()?;
        
        // Validate voter eligibility
        let voting_power = calculate_voting_power(&voter_id)?;
        if voting_power == 0 {
            return Err("Not eligible to vote on moderation proposals".into());
        }
        
        with_state_mut(|state| {
            let proposal = state.moderation_proposals.get_mut(&proposal_id)
                .ok_or("Proposal not found")?;
            
            // Check proposal is still open for voting
            if !matches!(proposal.status, ProposalStatus::Open | ProposalStatus::Voting) {
                return Err("Proposal is no longer accepting votes".into());
            }
            
            // Check voting deadline
            if ic_cdk::api::time() > proposal.voting_deadline {
                proposal.status = ProposalStatus::Expired;
                return Err("Voting deadline has passed".into());
            }
            
            // Check if user already voted
            if proposal.votes.voters.iter().any(|v| v.voter_id == voter_id) {
                return Err("You have already voted on this proposal".into());
            }
            
            // Record vote
            let vote_record = VoterRecord {
                voter_id: voter_id.clone(),
                vote: vote.clone(),
                voting_power,
                reasoning,
                timestamp: ic_cdk::api::time(),
            };
            
            proposal.votes.voters.push(vote_record);
            
            // Update vote counts
            match vote {
                Vote::For => proposal.votes.votes_for += voting_power,
                Vote::Against => proposal.votes.votes_against += voting_power,
                Vote::Abstain => proposal.votes.votes_abstain += voting_power,
            }
            
            proposal.votes.total_voting_power += voting_power;
            proposal.votes.participation_rate = 
                (proposal.votes.voters.len() as f64) / (get_eligible_voters_count() as f64);
            
            // Check if proposal has reached decision threshold
            if Self::should_finalize_proposal(&proposal.votes) {
                Self::finalize_proposal_voting(proposal)?;
            }
            
            Ok(())
        })
    }
    
    /// Execute approved moderation action
    #[ic_cdk::update]
    pub async fn execute_moderation_action(proposal_id: ProposalId) -> Result<(), String> {
        let executor_id = authenticate_user()?;
        
        // Only moderators can execute actions
        if !is_moderator(&executor_id)? {
            return Err("Only moderators can execute approved actions".into());
        }
        
        with_state_mut(|state| {
            let proposal = state.moderation_proposals.get_mut(&proposal_id)
                .ok_or("Proposal not found")?;
            
            let action = match &proposal.status {
                ProposalStatus::Approved(action) => action.clone(),
                _ => return Err("Proposal is not approved for execution".into()),
            };
            
            // Execute the moderation action
            Self::apply_moderation_action(&proposal.content_reference, &action, state)?;
            
            // Update proposal status
            proposal.status = ProposalStatus::Executed;
            
            // Create audit entry
            let audit_entry = ModerationAuditEntry {
                action: ModerationAuditAction::ActionExecuted,
                proposal_id: Some(proposal_id.clone()),
                actor_id: executor_id,
                timestamp: ic_cdk::api::time(),
                details: format!("Executed moderation action: {:?}", action),
            };
            state.moderation_audit_log.push(audit_entry);
            
            // Notify affected users
            Self::notify_moderation_action(&proposal.content_reference, &action)?;
            
            Ok(())
        })
    }
    
    fn apply_moderation_action(
        content_ref: &ContentReference,
        action: &ModerationAction,
        state: &mut SocialNetworkState
    ) -> Result<(), String> {
        match content_ref {
            ContentReference::Post(post_id) => {
                let post = state.posts.get_mut(post_id)
                    .ok_or("Post not found")?;
                
                match action {
                    ModerationAction::NoAction => {
                        post.moderation_status = ModerationStatus::DAOApproved;
                    }
                    ModerationAction::AddWarningLabel(warning) => {
                        post.moderation_status = ModerationStatus::WarningLabel(warning.clone());
                    }
                    ModerationAction::RestrictVisibility => {
                        post.visibility = PostVisibility::FollowersOnly;
                        post.moderation_status = ModerationStatus::VisibilityRestricted;
                    }
                    ModerationAction::ContentRemoval(reason) => {
                        post.moderation_status = ModerationStatus::DAORemoved(reason.clone());
                        // Content remains for audit but marked as removed
                    }
                    ModerationAction::ShadowBan(duration) => {
                        // Apply shadow ban to author
                        if let Some(user) = state.users.get_mut(&post.author_id) {
                            user.moderation_status = UserModerationStatus::ShadowBanned {
                                until: ic_cdk::api::time() + duration,
                                reason: "DAO-approved shadow ban".into(),
                            };
                        }
                    }
                    ModerationAction::TemporarySuspension(duration) => {
                        // Suspend author
                        if let Some(user) = state.users.get_mut(&post.author_id) {
                            user.moderation_status = UserModerationStatus::Suspended {
                                until: ic_cdk::api::time() + duration,
                                reason: "DAO-approved suspension".into(),
                            };
                        }
                    }
                    ModerationAction::AccountTermination(reason) => {
                        // Terminate author's account
                        if let Some(user) = state.users.get_mut(&post.author_id) {
                            user.moderation_status = UserModerationStatus::Terminated {
                                reason: reason.clone(),
                                decided_at: ic_cdk::api::time(),
                            };
                        }
                    }
                    _ => {}
                }
            }
            ContentReference::Comment(comment_id) => {
                // Similar logic for comments
                let comment = state.comments.get_mut(comment_id)
                    .ok_or("Comment not found")?;
                
                // Apply moderation action to comment
                Self::apply_comment_moderation(comment, action)?;
            }
            ContentReference::User(user_id) => {
                // Apply user-level moderation
                let user = state.users.get_mut(user_id)
                    .ok_or("User not found")?;
                
                Self::apply_user_moderation(user, action)?;
            }
        }
        
        Ok(())
    }
    
    fn should_finalize_proposal(votes: &VoteTracker) -> bool {
        // Finalize if we have minimum participation and clear majority
        let min_participation = 0.1; // 10% of eligible voters
        let majority_threshold = 0.6; // 60% supermajority
        
        if votes.participation_rate < min_participation {
            return false;
        }
        
        let total_decisive_votes = votes.votes_for + votes.votes_against;
        if total_decisive_votes == 0 {
            return false;
        }
        
        let for_ratio = votes.votes_for as f64 / total_decisive_votes as f64;
        let against_ratio = votes.votes_against as f64 / total_decisive_votes as f64;
        
        // Clear majority either way
        for_ratio >= majority_threshold || against_ratio >= majority_threshold
    }
    
    fn finalize_proposal_voting(proposal: &mut ModerationProposal) -> Result<(), String> {
        let total_decisive_votes = proposal.votes.votes_for + proposal.votes.votes_against;
        
        if total_decisive_votes == 0 {
            proposal.status = ProposalStatus::Rejected;
            return Ok(());
        }
        
        let approval_ratio = proposal.votes.votes_for as f64 / total_decisive_votes as f64;
        
        if approval_ratio >= 0.6 {
            proposal.status = ProposalStatus::Approved(proposal.proposed_action.clone());
        } else {
            proposal.status = ProposalStatus::Rejected;
        }
        
        Ok(())
    }
}

// Voting power calculation
fn calculate_voting_power(user_id: &UserId) -> Result<u64, String> {
    with_state(|state| {
        let user = state.users.get(user_id)
            .ok_or("User not found")?;
        
        let mut voting_power = 1; // Base vote
        
        // Increase power based on reputation and activity
        if user.verification_status == VerificationStatus::Verified {
            voting_power += 2;
        }
        
        // Account age bonus (1 additional power per 6 months)
        let account_age_months = (ic_cdk::api::time() - user.created_at) / 
            (30 * 24 * 60 * 60 * 1_000_000_000);
        voting_power += (account_age_months / 6) as u64;
        
        // Activity bonus based on positive contributions
        let positive_activity_score = calculate_positive_activity_score(user_id, state);
        voting_power += positive_activity_score / 100; // 1 power per 100 positive actions
        
        // Cap maximum voting power
        voting_power = std::cmp::min(voting_power, 10);
        
        Ok(voting_power)
    })
}

// Appeal system
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ModerationAppeal {
    pub id: AppealId,
    pub original_proposal_id: ProposalId,
    pub appellant_id: UserId,
    pub appeal_reasoning: String,
    pub new_evidence: Vec<EvidenceItem>,
    pub status: AppealStatus,
    pub created_at: u64,
    pub reviewed_at: Option<u64>,
    pub reviewer_decision: Option<AppealDecision>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum AppealStatus {
    Submitted,
    UnderReview,
    ReviewComplete,
    Escalated,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum AppealDecision {
    Upheld,                          // Original decision stands
    Reversed,                        // Original decision overturned
    Modified(ModerationAction),      // Original action modified
    RequiresNewVote,                 // Send back to DAO for new vote
}
```

## Automated Detection Systems

### Spam Prevention

```rust
// Automated spam detection
pub struct SpamDetectionSystem;

impl SpamDetectionSystem {
    /// Analyze content for spam indicators
    pub fn analyze_for_spam(content: &str, author_id: &UserId) -> SpamAnalysis {
        let mut spam_score = 0;
        let mut indicators = Vec::new();
        
        // Check for repetitive content
        if Self::is_repetitive_content(content) {
            spam_score += 30;
            indicators.push(SpamIndicator::RepetitiveContent);
        }
        
        // Check for excessive links
        let link_count = Self::count_links(content);
        if link_count > 5 {
            spam_score += 20;
            indicators.push(SpamIndicator::ExcessiveLinks);
        }
        
        // Check for suspicious patterns
        if Self::has_suspicious_patterns(content) {
            spam_score += 25;
            indicators.push(SpamIndicator::SuspiciousPatterns);
        }
        
        // Check author history
        let author_reputation = Self::get_author_reputation(author_id);
        if author_reputation < 10 {
            spam_score += 15;
            indicators.push(SpamIndicator::LowReputation);
        }
        
        // Check posting frequency
        if Self::is_posting_too_frequently(author_id) {
            spam_score += 40;
            indicators.push(SpamIndicator::HighFrequency);
        }
        
        SpamAnalysis {
            spam_score,
            confidence: Self::calculate_confidence(&indicators),
            indicators,
            recommended_action: Self::recommend_action(spam_score),
        }
    }
    
    fn is_repetitive_content(content: &str) -> bool {
        // Check for repeated phrases or characters
        let words: Vec<&str> = content.split_whitespace().collect();
        let mut word_counts = std::collections::HashMap::new();
        
        for word in &words {
            *word_counts.entry(word.to_lowercase()).or_insert(0) += 1;
        }
        
        // Flag if any word appears more than 20% of total words
        let max_repetition = words.len() / 5;
        word_counts.values().any(|&count| count > max_repetition)
    }
    
    fn count_links(content: &str) -> usize {
        let link_patterns = [
            regex::Regex::new(r"https?://\S+").unwrap(),
            regex::Regex::new(r"www\.\S+").unwrap(),
            regex::Regex::new(r"\S+\.\w{2,}").unwrap(),
        ];
        
        link_patterns.iter()
            .map(|pattern| pattern.find_iter(content).count())
            .sum()
    }
    
    fn has_suspicious_patterns(content: &str) -> bool {
        let suspicious_patterns = [
            r"(?i)(click here|buy now|limited time|act now)",
            r"(?i)(free money|get rich|guaranteed)",
            r"(?i)(urgent|immediate|expires soon)",
            r"\$\d+.*guaranteed",
            r"(?i)(work from home|make money online)",
        ];
        
        suspicious_patterns.iter()
            .any(|pattern| regex::Regex::new(pattern).unwrap().is_match(content))
    }
    
    fn recommend_action(spam_score: u8) -> AutoModerationAction {
        match spam_score {
            0..=20 => AutoModerationAction::Allow,
            21..=40 => AutoModerationAction::FlagForReview,
            41..=60 => AutoModerationAction::RequireVerification,
            61..=80 => AutoModerationAction::ShadowBan,
            81..=100 => AutoModerationAction::Block,
            _ => AutoModerationAction::Block,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct SpamAnalysis {
    pub spam_score: u8,              // 0-100 spam likelihood
    pub confidence: f64,             // Confidence in analysis
    pub indicators: Vec<SpamIndicator>,
    pub recommended_action: AutoModerationAction,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SpamIndicator {
    RepetitiveContent,
    ExcessiveLinks,
    SuspiciousPatterns,
    LowReputation,
    HighFrequency,
    SuspiciousAccount,
    MaliciousLinks,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum AutoModerationAction {
    Allow,
    FlagForReview,
    RequireVerification,
    ShadowBan,
    Block,
}
```

### Harmful Content Detection

```rust
// Content safety analysis
pub struct ContentSafetySystem;

impl ContentSafetySystem {
    /// Analyze content for harmful elements
    pub fn analyze_content_safety(content: &str) -> ContentSafetyAnalysis {
        let mut safety_issues = Vec::new();
        let mut severity_score = 0;
        
        // Check for violence indicators
        if Self::contains_violence_indicators(content) {
            safety_issues.push(SafetyIssue::Violence);
            severity_score += 30;
        }
        
        // Check for self-harm content
        if Self::contains_self_harm_indicators(content) {
            safety_issues.push(SafetyIssue::SelfHarm);
            severity_score += 40;
        }
        
        // Check for hate speech
        if Self::contains_hate_speech(content) {
            safety_issues.push(SafetyIssue::HateSpeech);
            severity_score += 35;
        }
        
        // Check for harassment patterns
        if Self::contains_harassment_patterns(content) {
            safety_issues.push(SafetyIssue::Harassment);
            severity_score += 25;
        }
        
        // Check for adult content
        if Self::contains_adult_content(content) {
            safety_issues.push(SafetyIssue::AdultContent);
            severity_score += 20;
        }
        
        ContentSafetyAnalysis {
            safety_issues,
            severity_score,
            requires_immediate_action: severity_score > 70,
            recommended_restrictions: Self::recommend_restrictions(&safety_issues, severity_score),
        }
    }
    
    fn contains_violence_indicators(content: &str) -> bool {
        let violence_patterns = [
            r"(?i)(kill|murder|hurt|harm|attack|violence)",
            r"(?i)(weapon|gun|knife|bomb|explosive)",
            r"(?i)(threat|threaten|gonna hurt|will hurt)",
        ];
        
        violence_patterns.iter()
            .any(|pattern| regex::Regex::new(pattern).unwrap().is_match(content))
    }
    
    fn contains_self_harm_indicators(content: &str) -> bool {
        let self_harm_patterns = [
            r"(?i)(suicide|kill myself|end it all|cut myself)",
            r"(?i)(self harm|self hurt|want to die)",
            r"(?i)(no point living|better off dead)",
        ];
        
        self_harm_patterns.iter()
            .any(|pattern| regex::Regex::new(pattern).unwrap().is_match(content))
    }
    
    fn contains_hate_speech(content: &str) -> bool {
        // Implementation would include patterns for hate speech detection
        // This is a sensitive area requiring careful implementation
        // and regular updates based on evolving language patterns
        
        // Basic pattern matching for demonstration
        let hate_indicators = [
            r"(?i)(hate|despise|disgust).*(?:people|group|race|religion)",
            r"(?i)(should die|deserve death|kill all)",
        ];
        
        hate_indicators.iter()
            .any(|pattern| regex::Regex::new(pattern).unwrap().is_match(content))
    }
    
    fn recommend_restrictions(
        issues: &[SafetyIssue], 
        severity: u8
    ) -> Vec<ContentRestriction> {
        let mut restrictions = Vec::new();
        
        if severity > 70 {
            restrictions.push(ContentRestriction::ImmediateRemoval);
        } else if severity > 40 {
            restrictions.push(ContentRestriction::RequireWarning);
            restrictions.push(ContentRestriction::AgeRestrict);
        } else if severity > 20 {
            restrictions.push(ContentRestriction::RequireWarning);
        }
        
        for issue in issues {
            match issue {
                SafetyIssue::SelfHarm => {
                    restrictions.push(ContentRestriction::AddSupportResources);
                }
                SafetyIssue::AdultContent => {
                    restrictions.push(ContentRestriction::AgeRestrict);
                }
                _ => {}
            }
        }
        
        restrictions
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ContentSafetyAnalysis {
    pub safety_issues: Vec<SafetyIssue>,
    pub severity_score: u8,
    pub requires_immediate_action: bool,
    pub recommended_restrictions: Vec<ContentRestriction>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SafetyIssue {
    Violence,
    SelfHarm,
    HateSpeech,
    Harassment,
    AdultContent,
    Misinformation,
    Copyright,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ContentRestriction {
    RequireWarning,
    AgeRestrict,
    ImmediateRemoval,
    AddSupportResources,
    LimitDistribution,
}
```

## Frontend Moderation Interface

```typescript
// Community moderation dashboard
export function ModerationDashboard() {
  const { authState } = useAuth();
  const [proposals, setProposals] = useState<ModerationProposal[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [activeTab, setActiveTab] = useState<'proposals' | 'reports' | 'appeals'>('proposals');

  useEffect(() => {
    if (authState.userProfile?.moderationPrivileges) {
      loadModerationData();
    }
  }, [authState.userProfile, activeTab]);

  const loadModerationData = async () => {
    try {
      const [proposalsData, reportsData] = await Promise.all([
        ModerationService.getActiveProposals(),
        ModerationService.getPendingReports(),
      ]);
      setProposals(proposalsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    }
  };

  if (!authState.userProfile?.moderationPrivileges) {
    return (
      <div className="text-center py-12">
        <ShieldExclamationIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Moderation Access Required
        </h3>
        <p className="text-gray-600">
          You need moderation privileges to access this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Moderation</h1>
          <p className="mt-2 text-gray-600">
            Transparent, community-driven content moderation
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'proposals', label: 'Active Proposals', count: proposals.length },
              { id: 'reports', label: 'Pending Reports', count: reports.length },
              { id: 'appeals', label: 'Appeals', count: 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <ProposalCard 
                key={proposal.id} 
                proposal={proposal}
                onVote={handleVote}
              />
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {reports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report}
                onEscalate={handleEscalateToDAO}
                onResolve={handleResolveReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Proposal voting component
function ProposalCard({ 
  proposal, 
  onVote 
}: { 
  proposal: ModerationProposal; 
  onVote: (proposalId: string, vote: Vote, reasoning?: string) => void;
}) {
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [showVoting, setShowVoting] = useState(false);

  const handleSubmitVote = async () => {
    if (!selectedVote) return;
    
    try {
      await onVote(proposal.id, selectedVote, reasoning || undefined);
      setShowVoting(false);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Moderation Proposal #{proposal.id.slice(-8)}
          </h3>
          <p className="text-sm text-gray-600">
            Proposed by {proposal.proposerUsername} • {formatTimeAgo(proposal.createdAt)}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          proposal.status === 'open' 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {proposal.status}
        </span>
      </div>

      {/* Content Reference */}
      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Reported Content</h4>
        <ContentPreview contentRef={proposal.contentReference} />
      </div>

      {/* Proposed Action */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Proposed Action</h4>
        <p className="text-gray-700">
          <ActionBadge action={proposal.proposedAction} />
        </p>
      </div>

      {/* Reasoning */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Reasoning</h4>
        <p className="text-gray-700">{proposal.reasoning}</p>
      </div>

      {/* Voting Progress */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Community Vote</h4>
        <VotingProgress votes={proposal.votes} />
      </div>

      {/* Voting Actions */}
      {proposal.status === 'open' && (
        <div className="border-t pt-4">
          {!showVoting ? (
            <button
              onClick={() => setShowVoting(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Cast Your Vote
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-4">
                {[
                  { value: 'for' as Vote, label: 'Support Action', color: 'green' },
                  { value: 'against' as Vote, label: 'Oppose Action', color: 'red' },
                  { value: 'abstain' as Vote, label: 'Abstain', color: 'gray' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="vote"
                      value={option.value}
                      onChange={(e) => setSelectedVote(e.target.value as Vote)}
                      className="mr-2"
                    />
                    <span className={`text-${option.color}-700`}>{option.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reasoning (Optional)
                </label>
                <textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Explain your vote..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitVote}
                  disabled={!selectedVote}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Vote
                </button>
                <button
                  onClick={() => setShowVoting(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Voting progress visualization
function VotingProgress({ votes }: { votes: VoteTracker }) {
  const totalVotes = votes.votesFor + votes.votesAgainst + votes.votesAbstain;
  const forPercentage = totalVotes > 0 ? (votes.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votes.votesAgainst / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (votes.votesAbstain / totalVotes) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Participation: {(votes.participationRate * 100).toFixed(1)}%</span>
        <span>Total Votes: {totalVotes}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div className="h-full flex">
          <div 
            className="bg-green-500 h-full"
            style={{ width: `${forPercentage}%` }}
          />
          <div 
            className="bg-red-500 h-full"
            style={{ width: `${againstPercentage}%` }}
          />
          <div 
            className="bg-gray-400 h-full"
            style={{ width: `${abstainPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-green-700">
          Support: {votes.votesFor} ({forPercentage.toFixed(1)}%)
        </span>
        <span className="text-red-700">
          Oppose: {votes.votesAgainst} ({againstPercentage.toFixed(1)}%)
        </span>
        <span className="text-gray-600">
          Abstain: {votes.votesAbstain} ({abstainPercentage.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
```

Remember: Content moderation in deCentra must balance free speech with community safety, always favoring transparency and community governance over centralized control. The DAO-based system ensures no single entity can silence legitimate discourse while protecting users from harmful content.