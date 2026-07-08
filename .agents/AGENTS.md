# RK Coaching LMS - Permanent Role-Based Dashboard Policy

**CORE DESIGN PRINCIPLE**
"One Role = One Responsibility = One Dashboard"
Every user role should only see the tools required to perform its own responsibilities.
The dashboard should answer only one question: "What should I do next?"
Avoid information overload, unnecessary navigation, duplicate actions.
Maintain a clean, minimal, professional experience.

**STUDENT DASHBOARD**
Purpose: Learning only.
Must NEVER see administration or content management features.
Contains ONLY:
- Live Quiz Arena
- Previous Year Papers (PYQ)
- Your Academic Standard
- Let's Study (Academic Standard -> Subject -> Free/Premium Materials -> Chapter -> Notes / Video Lectures)
- Explore All Academic Standards
The student's only responsibility is to study.

**TEACHER DASHBOARD**
Purpose: Create and manage educational content.
Contains ONLY:
- My Assignments
- Upload Notes
- Upload Video Lectures
- Upload Quiz Questions
- Upload Previous Year Papers (PYQs)
Below these actions display only:
- Draft
- Under Review
- Published
- Rejected
Teachers must NEVER access: Academic Management, User Management, Payments, System Settings, Student Management, Role Management.
The teacher's responsibility begins with content creation and ends with submitting content for review.

**SUPER ADMIN DASHBOARD**
Purpose: Administration and approvals.
Sidebar contains ONLY: Dashboard, Academic, Users, Teachers, Content, Payments, Settings.
Home dashboard displays ONLY actionable work:
- Pending Content Reviews
- Pending Teacher Assignments
- Pending User Approvals
- Recent Activity
- Pending Payment Verifications
- Quick Actions
Avoid excessive reports/statistics.

**WORKFLOW RESPONSIBILITY**
- Student -> Study -> Attempt Live Quiz -> Attempt PYQs
- Teacher -> Upload Content -> Submit For Review
- Super Admin -> Review -> Approve / Reject -> Publish -> Student Access
Every role performs only its own responsibilities. No overlapping workflows.

**UI POLICY**
Maintain: Dark Theme, Glassmorphism, Mobile First, Minimal Design, Responsive Layout, Consistent Buttons, Consistent Forms, Maximum Readability, Minimal Clicks, Confusion-Free Navigation.
If a feature does not help the current role perform its task, it should not be visible.

**IMPLEMENTATION RULES**
Before adding any future feature, verify:
1. Does it belong to the current user's role?
2. Does it simplify the workflow?
3. Does it reduce clicks?
4. Does it keep the dashboard clean?
5. Does it avoid confusing the user?
If NO, redesign or postpone the feature.

**PERMANENT PROJECT POLICY**
No dashboard should become information-heavy.
No role should receive unnecessary functionality.
Every new feature must integrate into the existing workflow instead of creating a new workflow.
The Student Portal, Teacher Portal, and Super Admin Portal must remain independent, focused, and purpose-driven.
One Role -> One Responsibility -> One Dashboard -> One Clear Workflow -> One Purpose Per Screen.
