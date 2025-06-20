# AI Governance Control System Documentation

## Overview

The AI Governance Control System implements a balanced approach to AI autonomy for the Oracle Referendum platform. It classifies AI-generated polls based on their severity and category, applying appropriate governance controls while preserving AI autonomy where appropriate.

## System Architecture

### Database Tables

1. **ai_governance_config**
   - Stores governance rules for different decision categories
   - Fields: `id`, `decision_category`, `autonomy_level`, `severity_threshold`, `admin_override_window_hours`, `requires_admin_approval`, `emergency_bypass_allowed`, `config_json`, `active`, `created_at`, `updated_at`

2. **ai_decisions**
   - Stores AI decision records that may become polls
   - Fields: `id`, `decision_type`, `decision_title`, `decision_description`, `reasoning`, `confidence_score`, `severity_level`, `data_sources`, `poll_id`, `created_at`, `processed_at`, `autonomy_level`, `admin_action_required`, `governance_classification`

3. **poll_drafts**
   - Stores draft polls pending admin approval
   - Fields: `id`, `source_decision_id`, `poll_data`, `autonomy_level`, `severity_level`, `draft_status`, `admin_action_required`, `approval_deadline`, `created_at`, `approved_at`, `approved_by`, `rejection_reason`, `poll_id`

4. **admin_override_windows**
   - Tracks admin override windows for delayed autonomy polls
   - Fields: `id`, `poll_id`, `admin_override_deadline`, `override_used`, `override_action`, `override_reason`, `override_by`, `created_at`

5. **admin_governance_log**
   - Logs all admin governance actions
   - Fields: `id`, `admin_wallet`, `action_type`, `poll_draft_id`, `poll_id`, `reasoning`, `action_data`, `created_at`

6. **emergency_brake_status**
   - Tracks emergency brake status
   - Fields: `id`, `active`, `reason`, `duration_hours`, `activated_at`, `activated_by`, `expires_at`, `deactivated_at`, `deactivated_by`

### Database Functions

1. **get_autonomy_level_for_decision(p_decision_category text, p_severity_level integer)**
   - Determines the appropriate autonomy level for a decision based on its category and severity
   - Returns: `full_autonomous`, `admin_notified`, `admin_delayed`, or `admin_approval`

### Edge Functions

1. **admin-governance-actions**
   - Handles admin controls for the AI Poll System
   - Actions:
     - `approve_poll`: Approves a poll draft and creates an active poll
     - `reject_poll`: Rejects a poll draft with a reason
     - `emergency_brake`: Activates the emergency brake to halt autonomous poll creation
     - `override_poll`: Applies admin override to an existing poll (pause, cancel, modify)
     - `update_config`: Updates governance configuration rules

2. **ai-prophet-agent**
   - Transforms AI decisions into polls with governance controls
   - Key functions:
     - `createPollWithGovernanceControl`: Applies governance rules to poll creation
     - `createPollDirectly`: Creates autonomous polls
     - `createPollDraft`: Creates draft polls for admin approval
     - `createAdminOverrideWindow`: Creates admin override window for delayed polls

3. **test-ai-governance**
   - Test function for simulating various governance scenarios
   - Test scenarios:
     - `low_severity_game_balance`: Tests fully autonomous polls
     - `high_severity_economic`: Tests admin approval polls
     - `critical_technical`: Tests critical decisions requiring approval
     - `mixed_scenarios`: Tests various severity levels
     - `emergency_test`: Tests emergency brake functionality

## Autonomy Classification System

The system classifies decisions into four autonomy levels based on severity and category:

1. **Full Autonomous** (severity 1-3)
   - AI creates polls immediately without admin intervention
   - Suitable for low-impact decisions like minor game balance adjustments

2. **Admin Notified** (severity 4-6)
   - AI creates polls immediately but sends notification to admins
   - Suitable for moderate-impact decisions where admin awareness is helpful

3. **Admin Delayed** (severity 7-8)
   - AI creates polls with 24-hour admin override window
   - Admins can review and override before the window expires
   - Suitable for significant decisions that may need admin review

4. **Admin Approval** (severity 9-10)
   - AI creates poll drafts that require explicit admin approval
   - No polls are created until approved by an admin
   - Suitable for high-impact decisions like major economic changes

## Admin Dashboard Controls

The Admin Dashboard provides a comprehensive interface for managing the AI Governance system:

1. **Emergency Brake Control**
   - Immediately halts all AI poll generation
   - Requires admin approval for any new polls
   - Can be activated with a reason and duration

2. **AI Status Overview**
   - Shows counts of pending approvals, override windows, and config rules
   - Displays emergency brake status

3. **Pending Poll Approvals**
   - Lists all draft polls requiring admin approval
   - Shows poll details, autonomy level, and severity
   - Provides approve and reject buttons with reasoning fields

4. **Active Override Windows**
   - Lists polls with active admin override windows
   - Shows deadline for admin intervention
   - Provides override options (pause, cancel, modify)

5. **Governance Configuration**
   - Displays current governance rules by category
   - Allows updating autonomy thresholds and override windows

## Usage Flow

### Autonomous Poll Creation

1. AI makes a decision (via ai-analyst-agent or other AI agent)
2. Decision is stored in `ai_decisions` table
3. Prophet Agent retrieves unprocessed decisions
4. Governance rules are applied based on decision category and severity
5. For low severity (1-3), poll is created immediately
6. Poll appears in the Oracle Referendum for community voting

### Admin Approval Flow

1. AI makes a high-severity decision (severity 9-10)
2. Decision is stored in `ai_decisions` table with `admin_action_required = true`
3. Prophet Agent creates a poll draft in `poll_drafts` table
4. Admin is notified of pending approval
5. Admin reviews draft in the Admin Dashboard
6. Admin approves or rejects with reasoning
7. If approved, poll is created and appears in Oracle Referendum

### Admin Override Flow

1. AI makes a moderate-high severity decision (severity 7-8)
2. Decision is processed with `admin_delayed` autonomy level
3. Poll is created immediately but with an override window
4. Admin override window is created in `admin_override_windows` table
5. Admin can review and override within the window (typically 24 hours)
6. If no override occurs, poll proceeds normally

### Emergency Brake

1. Admin activates emergency brake with reason and duration
2. Emergency brake status is updated in `emergency_brake_status` table
3. All autonomous poll creation is halted
4. New decisions require explicit admin approval
5. Brake expires after the specified duration or manual deactivation

## Testing

The system includes a comprehensive test function (`test-ai-governance`) that simulates various governance scenarios:

1. **Low Severity Game Balance**
   - Creates a game balance decision with severity 2-3
   - Tests full autonomous poll creation

2. **High Severity Economic**
   - Creates an economic policy decision with severity 9
   - Tests admin approval workflow

3. **Critical Technical**
   - Creates a technical upgrade decision with severity 10
   - Tests admin approval for critical decisions

4. **Mixed Scenarios**
   - Creates random decisions with varying severity levels
   - Tests different autonomy classifications

5. **Emergency Test**
   - Tests emergency brake activation and effect on poll creation

## Conclusion

The AI Governance Control System successfully balances AI autonomy with appropriate admin oversight. It allows the Oracle AI to operate independently for low-impact decisions while ensuring proper human review for significant changes. This creates a truly autonomous AI democratic governance system with appropriate safeguards. 