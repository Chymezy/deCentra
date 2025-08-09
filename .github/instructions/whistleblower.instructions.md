---
applyTo: "**"
---

# Whistleblower Protection Features

## Anonymous Posting System

### Identity Protection Framework

```rust
// Anonymous identity management for whistleblowers
use ic_cdk::api::management_canister::main::raw_rand;
use sha2::{Sha256, Digest};

pub struct AnonymousIdentityManager;

impl AnonymousIdentityManager {
    pub async fn create_whistleblower_identity() -> Result<WhistleblowerIdentity, String> {
        // Generate cryptographically secure anonymous identity
        let random_bytes = raw_rand().await
            .map_err(|_| "Failed to generate secure randomness")?
            .0;
        
        let mut hasher = Sha256::new();
        hasher.update(&random_bytes);
        hasher.update(ic_cdk::api::time().to_be_bytes());
        let hash = hasher.finalize();
        
        // Create unique but untraceable identity
        let anonymous_id = Principal::from_slice(&hash[..29])
            .map_err(|_| "Failed to create anonymous identity")?;
        
        Ok(WhistleblowerIdentity {
            id: UserId(anonymous_id),
            created_at: ic_cdk::api::time(),
            access_level: WhistleblowerAccess::Verified,
            protection_status: ProtectionStatus::Active,
            verification_hash: hash.to_vec(),
        })
    }
    
    pub fn verify_whistleblower_identity(
        identity: &WhistleblowerIdentity,
        verification_code: &str
    ) -> Result<bool, String> {
        // Verify without compromising anonymity
        let expected_hash = self.compute_verification_hash(
            &identity.verification_hash,
            verification_code
        );
        
        Ok(constant_time_compare(&expected_hash, &identity.verification_hash))
    }
    
    fn compute_verification_hash(base_hash: &[u8], code: &str) -> Vec<u8> {
        let mut hasher = Sha256::new();
        hasher.update(base_hash);
        hasher.update(code.as_bytes());
        hasher.finalize().to_vec()
    }
}

// Whistleblower-specific data structures
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct WhistleblowerIdentity {
    pub id: UserId,
    pub created_at: u64,
    pub access_level: WhistleblowerAccess,
    pub protection_status: ProtectionStatus,
    pub verification_hash: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum WhistleblowerAccess {
    Unverified,
    Verified,
    HighRisk,     // Extra protection for dangerous situations
    Compromised,  // Identity may be exposed
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ProtectionStatus {
    Active,
    Suspended,
    UnderInvestigation,
    WitnessProtection,
}

// Secure content submission for whistleblowers
#[ic_cdk::update]
pub async fn submit_whistleblower_report(
    encrypted_content: String,
    evidence_hashes: Vec<String>,
    organization_tags: Vec<String>,
    urgency_level: UrgencyLevel
) -> Result<ReportId, String> {
    // Create anonymous identity for this report
    let whistleblower_identity = AnonymousIdentityManager::create_whistleblower_identity().await?;
    
    // Validate content structure
    validate_whistleblower_content(&encrypted_content, &evidence_hashes)?;
    
    // Create secure report
    let report = WhistleblowerReport {
        id: ReportId(generate_secure_id()),
        submitter: whistleblower_identity,
        content: EncryptedContent {
            data: encrypted_content,
            encryption_method: EncryptionMethod::ThresholdEncryption,
            access_keys: generate_access_keys()?,
        },
        evidence: evidence_hashes.into_iter().map(|hash| EvidenceItem {
            content_hash: hash,
            verification_status: VerificationStatus::Pending,
            chain_of_custody: Vec::new(),
        }).collect(),
        organization_tags,
        urgency_level,
        submission_time: ic_cdk::api::time(),
        verification_status: ReportVerificationStatus::UnderReview,
        journalist_assignments: Vec::new(),
        legal_protections: LegalProtections::default(),
    };
    
    // Store with maximum security
    with_state_mut(|state| {
        state.whistleblower_reports.insert(report.id.clone(), report.clone());
        
        // Create secure audit trail
        let audit_entry = AuditEntry {
            action: AuditAction::ReportSubmitted,
            timestamp: ic_cdk::api::time(),
            report_id: Some(report.id.clone()),
            details: "Anonymous whistleblower report submitted".to_string(),
        };
        state.audit_trail.push(audit_entry);
        
        Ok(report.id)
    })
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct WhistleblowerReport {
    pub id: ReportId,
    pub submitter: WhistleblowerIdentity,
    pub content: EncryptedContent,
    pub evidence: Vec<EvidenceItem>,
    pub organization_tags: Vec<String>,
    pub urgency_level: UrgencyLevel,
    pub submission_time: u64,
    pub verification_status: ReportVerificationStatus,
    pub journalist_assignments: Vec<JournalistAssignment>,
    pub legal_protections: LegalProtections,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum UrgencyLevel {
    Low,          // Standard reporting
    Medium,       // Time-sensitive
    High,         // Immediate danger
    Critical,     // Life-threatening situation
}
```

### Encrypted Content Management

```rust
// Threshold encryption for whistleblower content
pub struct ThresholdEncryption;

impl ThresholdEncryption {
    pub fn encrypt_for_verified_access(
        content: &str,
        min_verifiers: u8
    ) -> Result<EncryptedContent, String> {
        // Generate threshold encryption keys
        let (master_key, shares) = self.generate_threshold_keys(min_verifiers)?;
        
        // Encrypt content with master key
        let encrypted_data = self.encrypt_with_key(content, &master_key)?;
        
        // Distribute key shares to verified journalists/authorities
        let access_keys = self.distribute_key_shares(shares)?;
        
        Ok(EncryptedContent {
            data: encrypted_data,
            encryption_method: EncryptionMethod::ThresholdEncryption,
            access_keys,
        })
    }
    
    pub fn decrypt_with_threshold(
        encrypted_content: &EncryptedContent,
        key_shares: Vec<KeyShare>
    ) -> Result<String, String> {
        // Verify minimum threshold met
        if key_shares.len() < encrypted_content.min_threshold() {
            return Err("Insufficient key shares for decryption".into());
        }
        
        // Reconstruct master key from shares
        let master_key = self.reconstruct_key_from_shares(&key_shares)?;
        
        // Decrypt content
        self.decrypt_with_key(&encrypted_content.data, &master_key)
    }
    
    fn generate_threshold_keys(min_verifiers: u8) -> Result<(MasterKey, Vec<KeyShare>), String> {
        // Implement Shamir's Secret Sharing
        // For MVP, simulate with distributed keys
        let master_key = self.generate_master_key()?;
        let shares = self.split_key_into_shares(&master_key, min_verifiers)?;
        
        Ok((master_key, shares))
    }
    
    fn distribute_key_shares(shares: Vec<KeyShare>) -> Result<Vec<AccessKey>, String> {
        // Distribute to verified journalists and authorities
        let verified_entities = get_verified_entities()?;
        
        if verified_entities.len() < shares.len() {
            return Err("Insufficient verified entities for key distribution".into());
        }
        
        let mut access_keys = Vec::new();
        for (i, share) in shares.into_iter().enumerate() {
            if let Some(entity) = verified_entities.get(i) {
                access_keys.push(AccessKey {
                    entity_id: entity.id.clone(),
                    key_share: share,
                    access_granted_at: ic_cdk::api::time(),
                });
            }
        }
        
        Ok(access_keys)
    }
}

// Legal protection framework
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct LegalProtections {
    pub jurisdiction: String,
    pub applicable_laws: Vec<WhistleblowerLaw>,
    pub protection_status: ProtectionLevel,
    pub legal_contacts: Vec<LegalContact>,
    pub secure_communication_channels: Vec<SecureChannel>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum WhistleblowerLaw {
    WhistleblowerProtectionAct,     // US Federal
    SOXAct,                         // Sarbanes-Oxley
    DoddFrank,                      // Financial sector
    GDPR,                           // EU data protection
    FreedomOfInformationAct,        // FOIA
    Custom(String),                 // Jurisdiction-specific
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ProtectionLevel {
    Basic,                          // Standard legal protections
    Enhanced,                       // Additional safeguards
    WitnessProtection,             // Government protection programs
    InternationalProtection,        // Cross-border protections
}

// Journalist verification and access system
pub struct JournalistVerification;

impl JournalistVerification {
    pub fn verify_journalist_credentials(
        journalist_id: &UserId,
        credentials: JournalistCredentials
    ) -> Result<VerificationResult, String> {
        // Verify through multiple channels
        let press_card_valid = self.verify_press_card(&credentials.press_card)?;
        let employment_valid = self.verify_employment(&credentials.employer)?;
        let reputation_score = self.calculate_reputation_score(journalist_id)?;
        
        let verification_level = match (press_card_valid, employment_valid, reputation_score) {
            (true, true, score) if score >= 80 => VerificationLevel::FullyVerified,
            (true, true, score) if score >= 60 => VerificationLevel::Verified,
            (true, false, score) if score >= 70 => VerificationLevel::ConditionallyVerified,
            _ => VerificationLevel::Unverified,
        };
        
        Ok(VerificationResult {
            level: verification_level,
            valid_until: ic_cdk::api::time() + (365 * 24 * 60 * 60 * 1_000_000_000), // 1 year
            restrictions: self.determine_access_restrictions(&verification_level),
        })
    }
    
    pub fn grant_report_access(
        journalist_id: &UserId,
        report_id: &ReportId,
        justification: String
    ) -> Result<AccessGrant, String> {
        // Verify journalist has appropriate credentials
        let verification = get_journalist_verification(journalist_id)?;
        if verification.level == VerificationLevel::Unverified {
            return Err("Journalist not verified for whistleblower access".into());
        }
        
        // Check if report requires this level of verification
        let report = get_whistleblower_report(report_id)?;
        if !self.access_level_sufficient(&verification.level, &report.urgency_level) {
            return Err("Insufficient verification level for this report".into());
        }
        
        // Create access grant with audit trail
        let access_grant = AccessGrant {
            journalist_id: journalist_id.clone(),
            report_id: report_id.clone(),
            granted_at: ic_cdk::api::time(),
            expires_at: ic_cdk::api::time() + (7 * 24 * 60 * 60 * 1_000_000_000), // 7 days
            access_level: AccessLevel::from_verification(&verification.level),
            justification,
            audit_trail: Vec::new(),
        };
        
        // Record access grant
        with_state_mut(|state| {
            state.journalist_access_grants.insert(
                (journalist_id.clone(), report_id.clone()),
                access_grant.clone()
            );
        });
        
        Ok(access_grant)
    }
}
```

## Security Measures

### Traffic Analysis Resistance

```rust
// Traffic analysis protection for whistleblowers
pub struct TrafficAnalysisProtection;

impl TrafficAnalysisProtection {
    pub fn submit_with_timing_protection(
        content: EncryptedContent,
        delay_strategy: DelayStrategy
    ) -> Result<SubmissionId, String> {
        // Add random delays to prevent timing correlation
        let submission_delay = self.calculate_submission_delay(&delay_strategy);
        
        // Schedule submission with timing protection
        ic_cdk::timer::set_timer(
            Duration::from_nanos(submission_delay),
            move || {
                // Submit with additional noise
                self.submit_with_noise_injection(content)
            }
        );
        
        Ok(SubmissionId::new())
    }
    
    fn calculate_submission_delay(strategy: &DelayStrategy) -> u64 {
        match strategy {
            DelayStrategy::Immediate => 0,
            DelayStrategy::RandomShort => {
                // 1-10 minutes random delay
                let random = self.secure_random() % (10 * 60 * 1_000_000_000);
                60 * 1_000_000_000 + random
            }
            DelayStrategy::RandomLong => {
                // 1-24 hours random delay
                let random = self.secure_random() % (24 * 60 * 60 * 1_000_000_000);
                60 * 60 * 1_000_000_000 + random
            }
            DelayStrategy::ScheduledWindow(window) => {
                // Submit during specific time windows
                self.calculate_next_window_delay(window)
            }
        }
    }
    
    fn submit_with_noise_injection(content: EncryptedContent) -> Result<(), String> {
        // Generate decoy submissions to mask real submission
        let decoy_count = self.secure_random() % 5 + 1; // 1-5 decoys
        
        for i in 0..decoy_count {
            let decoy_delay = (i as u64) * (30 * 1_000_000_000); // 30 second intervals
            
            ic_cdk::timer::set_timer(
                Duration::from_nanos(decoy_delay),
                move || {
                    self.submit_decoy_content();
                }
            );
        }
        
        // Submit real content among decoys
        let real_submission_delay = self.secure_random() % (decoy_count as u64 * 30 * 1_000_000_000);
        ic_cdk::timer::set_timer(
            Duration::from_nanos(real_submission_delay),
            move || {
                self.submit_real_content(content);
            }
        );
        
        Ok(())
    }
    
    fn submit_decoy_content(&self) {
        // Create realistic but fake submissions
        let decoy_content = self.generate_decoy_content();
        
        // Submit through same channels as real content
        // This creates noise in traffic analysis
        let _ = submit_encrypted_content(decoy_content, true); // Mark as decoy
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum DelayStrategy {
    Immediate,
    RandomShort,
    RandomLong,
    ScheduledWindow(TimeWindow),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TimeWindow {
    pub start_hour: u8,  // 0-23
    pub end_hour: u8,    // 0-23
    pub timezone: String,
    pub days_of_week: Vec<u8>, // 0-6 (Sunday-Saturday)
}
```

### Metadata Scrubbing System

```rust
// Comprehensive metadata scrubbing for whistleblower protection
pub struct MetadataScrubber;

impl MetadataScrubber {
    pub fn scrub_submission_metadata(
        mut submission: WhistleblowerSubmission
    ) -> WhistleblowerSubmission {
        // Scrub temporal metadata
        submission.created_at = self.anonymize_timestamp(submission.created_at);
        
        // Scrub content metadata
        submission.content = self.scrub_content_metadata(&submission.content);
        
        // Scrub file metadata
        for evidence in &mut submission.evidence {
            evidence.metadata = self.scrub_file_metadata(&evidence.metadata);
        }
        
        // Remove identifying patterns
        submission = self.remove_identifying_patterns(submission);
        
        submission
    }
    
    fn anonymize_timestamp(timestamp: u64) -> u64 {
        // Round to nearest 4-hour window to prevent timing correlation
        let window_size = 4 * 60 * 60 * 1_000_000_000; // 4 hours in nanoseconds
        (timestamp / window_size) * window_size
    }
    
    fn scrub_content_metadata(content: &str) -> String {
        let mut scrubbed = content.to_string();
        
        // Remove document metadata patterns
        scrubbed = self.remove_document_properties(&scrubbed);
        scrubbed = self.remove_software_signatures(&scrubbed);
        scrubbed = self.remove_system_paths(&scrubbed);
        scrubbed = self.remove_network_identifiers(&scrubbed);
        scrubbed = self.remove_device_identifiers(&scrubbed);
        
        scrubbed
    }
    
    fn remove_document_properties(content: &str) -> String {
        // Remove Microsoft Office metadata patterns
        let office_patterns = [
            r"Creator: [^\n]+",
            r"Author: [^\n]+",
            r"Company: [^\n]+",
            r"Last Modified By: [^\n]+",
            r"Creation Date: [^\n]+",
            r"Modification Date: [^\n]+",
        ];
        
        let mut result = content.to_string();
        for pattern in &office_patterns {
            let regex = regex::Regex::new(pattern).unwrap();
            result = regex.replace_all(&result, "[METADATA_REMOVED]").to_string();
        }
        
        result
    }
    
    fn remove_software_signatures(content: &str) -> String {
        // Remove software-specific signatures
        let software_patterns = [
            r"Adobe \w+ \d+\.\d+",
            r"Microsoft \w+ \d+",
            r"LibreOffice \d+\.\d+",
            r"Google Docs",
            r"Pages \d+\.\d+",
        ];
        
        let mut result = content.to_string();
        for pattern in &software_patterns {
            let regex = regex::Regex::new(pattern).unwrap();
            result = regex.replace_all(&result, "[SOFTWARE_REMOVED]").to_string();
        }
        
        result
    }
    
    fn remove_system_paths(content: &str) -> String {
        // Remove file system paths that could identify systems
        let path_patterns = [
            r"C:\\Users\\[^\\]+",
            r"/Users/[^/]+",
            r"/home/[^/]+",
            r"\\\\[^\\]+\\",
            r"[A-Z]:\\[^\\]+",
        ];
        
        let mut result = content.to_string();
        for pattern in &path_patterns {
            let regex = regex::Regex::new(pattern).unwrap();
            result = regex.replace_all(&result, "[PATH_REMOVED]").to_string();
        }
        
        result
    }
    
    fn remove_network_identifiers(content: &str) -> String {
        // Remove IP addresses, MAC addresses, etc.
        let network_patterns = [
            r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b", // IPv4
            r"\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b", // IPv6
            r"\b(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}\b", // MAC address
        ];
        
        let mut result = content.to_string();
        for pattern in &network_patterns {
            let regex = regex::Regex::new(pattern).unwrap();
            result = regex.replace_all(&result, "[NETWORK_ID_REMOVED]").to_string();
        }
        
        result
    }
    
    fn remove_device_identifiers(content: &str) -> String {
        // Remove device-specific identifiers
        let device_patterns = [
            r"Serial Number: [^\n]+",
            r"Device ID: [^\n]+",
            r"IMEI: [^\n]+",
            r"UUID: [0-9a-fA-F-]+",
            r"Hardware ID: [^\n]+",
        ];
        
        let mut result = content.to_string();
        for pattern in &device_patterns {
            let regex = regex::Regex::new(pattern).unwrap();
            result = regex.replace_all(&result, "[DEVICE_ID_REMOVED]").to_string();
        }
        
        result
    }
    
    fn scrub_file_metadata(metadata: &FileMetadata) -> FileMetadata {
        FileMetadata {
            filename: "[REDACTED]".to_string(),
            size: metadata.size,
            mime_type: metadata.mime_type.clone(),
            created_at: self.anonymize_timestamp(metadata.created_at),
            modified_at: self.anonymize_timestamp(metadata.modified_at),
            // Remove all other identifying metadata
            camera_make: None,
            camera_model: None,
            gps_location: None,
            software_used: None,
            author: None,
            device_info: None,
        }
    }
}
```

### Frontend Whistleblower Interface

```typescript
// Secure whistleblower submission interface
export function WhistleblowerSubmissionForm() {
  const [submissionData, setSubmissionData] = useState<WhistleblowerSubmission>({
    content: '',
    urgencyLevel: 'medium',
    organizationTags: [],
    evidenceFiles: [],
    anonymityLevel: 'high',
  });
  
  const [securityWarnings, setSecurityWarnings] = useState<SecurityWarning[]>([]);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);

  useEffect(() => {
    // Enable anonymous mode by default for whistleblower interface
    enableAnonymousMode();
    setIsAnonymousMode(true);
  }, []);

  const enableAnonymousMode = () => {
    // Clear all tracking data
    SocialSecurityManager.getInstance().enableAnonymousMode();
    
    // Disable browser fingerprinting
    disableBrowserFingerprinting();
    
    // Show security recommendations
    showSecurityRecommendations();
  };

  const handleContentChange = (content: string) => {
    // Real-time content scrubbing
    const scrubbedContent = scrubPotentiallyIdentifyingInfo(content);
    const warnings = detectSecurityRisks(scrubbedContent);
    
    setSubmissionData(prev => ({ ...prev, content: scrubbedContent }));
    setSecurityWarnings(warnings);
  };

  const scrubPotentiallyIdentifyingInfo = (content: string): string => {
    let scrubbed = content;
    
    // Auto-redact common identifying patterns
    scrubbed = scrubbed.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN_REDACTED]');
    scrubbed = scrubbed.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
    scrubbed = scrubbed.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
    
    return scrubbed;
  };

  const detectSecurityRisks = (content: string): SecurityWarning[] => {
    const warnings: SecurityWarning[] = [];
    
    // Check for potentially identifying information
    if (content.toLowerCase().includes('my name') || content.toLowerCase().includes('i am')) {
      warnings.push({
        type: 'identity_risk',
        message: 'Content may contain identifying information',
        severity: 'high',
        suggestion: 'Consider using third-person language',
      });
    }
    
    // Check for specific dates/times
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(content) || /\d{1,2}:\d{2}/.test(content)) {
      warnings.push({
        type: 'temporal_risk',
        message: 'Specific dates and times can be identifying',
        severity: 'medium',
        suggestion: 'Use approximate timeframes instead',
      });
    }
    
    // Check for location specifics
    if (content.toLowerCase().includes('building') || content.toLowerCase().includes('room')) {
      warnings.push({
        type: 'location_risk',
        message: 'Specific location details detected',
        severity: 'medium',
        suggestion: 'Use general location descriptions',
      });
    }
    
    return warnings;
  };

  const handleSubmit = async () => {
    try {
      // Final security check
      const finalWarnings = detectSecurityRisks(submissionData.content);
      const highRiskWarnings = finalWarnings.filter(w => w.severity === 'high');
      
      if (highRiskWarnings.length > 0) {
        const proceed = await confirmHighRiskSubmission(highRiskWarnings);
        if (!proceed) return;
      }

      // Encrypt content before submission
      const encryptedContent = await encryptForThresholdAccess(
        submissionData.content,
        submissionData.urgencyLevel
      );

      // Submit with timing protection
      const submissionId = await submitWhistleblowerReport({
        ...submissionData,
        content: encryptedContent,
        submissionTime: Date.now(),
        protectionLevel: determineProtectionLevel(submissionData),
      });

      // Clear sensitive data
      clearSubmissionData();
      
      // Show confirmation with security advice
      showSubmissionConfirmation(submissionId);
      
    } catch (error) {
      console.error('Submission failed:', error);
      showSecureErrorMessage(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Security Status Indicator */}
      <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            Anonymous Mode Active - Enhanced Protection Enabled
          </span>
        </div>
      </div>

      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {securityWarnings.map((warning, index) => (
            <SecurityWarningCard key={index} warning={warning} />
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Urgency Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgency Level
          </label>
          <UrgencySelector
            value={submissionData.urgencyLevel}
            onChange={(level) => setSubmissionData(prev => ({ ...prev, urgencyLevel: level }))}
          />
        </div>

        {/* Content Input with Security Features */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Content
          </label>
          <SecureTextArea
            value={submissionData.content}
            onChange={handleContentChange}
            placeholder="Describe the incident, evidence, and context. Avoid including identifying information about yourself."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            securityMode="whistleblower"
          />
          <div className="mt-2 text-sm text-gray-600">
            Content is automatically encrypted and scrubbed of identifying information.
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidence Files (Optional)
          </label>
          <SecureFileUpload
            onUpload={(files) => setSubmissionData(prev => ({ 
              ...prev, 
              evidenceFiles: [...prev.evidenceFiles, ...files] 
            }))}
            acceptedTypes={['image/*', 'application/pdf', 'text/*']}
            maxSize={50 * 1024 * 1024} // 50MB
            securityLevel="high"
          />
        </div>

        {/* Organization Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizations Involved
          </label>
          <OrganizationTagInput
            tags={submissionData.organizationTags}
            onChange={(tags) => setSubmissionData(prev => ({ ...prev, organizationTags: tags }))}
            suggestions={getOrganizationSuggestions()}
          />
        </div>

        {/* Legal Protection Information */}
        <LegalProtectionInfo urgencyLevel={submissionData.urgencyLevel} />

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Your identity will remain completely anonymous. This submission is protected by law.
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
          >
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
```