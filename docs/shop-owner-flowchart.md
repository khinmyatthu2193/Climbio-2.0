# Climbio v2 Shop Owner Flowchart

This flowchart describes the correct shop-owner journey in the current v2 implementation.

## Symbol Rules

| Symbol | Meaning | Used for |
| --- | --- | --- |
| Rounded terminator | Start / End | Entry and final states |
| Rectangle | Process | User or system action |
| Diamond | Decision | Yes / no or status choice |
| Parallelogram | Input / Output | Forms, uploaded files, public link, PDF |
| Cylinder | Data store | Database records |

## Flowchart

```mermaid
flowchart TD
    Start([Start]) --> Visit[Shop owner opens Climbio]
    Visit --> HasAccount{Already has an account?}

    HasAccount -- No --> Register[/Enter name, email, phone, password/]
    Register --> CreateAccount[Create SHOP_OWNER account]
    CreateAccount --> UserDb[(User record: ACTIVE account, PENDING approval, no submitted application)]
    UserDb --> ApplicationPage[Redirect to Application page]

    HasAccount -- Yes --> Login[/Enter email and password/]
    Login --> AuthValid{Credentials valid?}
    AuthValid -- No --> LoginError[/Show login error/]
    LoginError --> Login
    AuthValid -- Yes --> RestoreSession[Issue access token and refresh token]
    RestoreSession --> ApprovalGate{Account active and shop approved?}

    ApplicationPage --> SubmittedYet{Application submitted?}
    ApprovalGate -- No --> ApplicationPage
    ApprovalGate -- Yes --> Dashboard[Open approved shop workspace]

    SubmittedYet -- No --> SubmitApplication[/Submit business details, shop logo, verification document/]
    SubmitApplication --> SaveApplication[Save application and disable public store]
    SaveApplication --> Pending[(Application status: PENDING)]
    Pending --> AdminReview[Admin reviews application]

    SubmittedYet -- Yes --> CurrentStatus{Current approval status?}
    CurrentStatus -- PENDING --> WaitReview[View application status and wait]
    CurrentStatus -- CHANGES_REQUESTED --> ChangesRequested
    CurrentStatus -- DECLINED --> Declined
    CurrentStatus -- SUSPENDED --> Suspended[(Approval status: SUSPENDED)]
    WaitReview --> AdminReview

    AdminReview --> AdminDecision{Admin decision}
    AdminDecision -- Approve --> Approved[(Approval status: APPROVED, account status: ACTIVE)]
    Approved --> Dashboard

    AdminDecision -- Request changes --> ChangesRequested[(Approval status: CHANGES_REQUESTED)]
    ChangesRequested --> EditApplication[/Edit requested business information/]
    EditApplication --> Resubmit[Resubmit application]
    Resubmit --> Pending

    AdminDecision -- Decline --> Declined[(Approval status: DECLINED)]
    Declined --> ContactSupport[/View declined status or contact support/]
    ContactSupport --> EndDeclined([End])
    Suspended --> ContactSupport

    Dashboard --> ChooseTask{Choose shop-owner task}
    ChooseTask -- Dashboard --> ViewMetrics[View revenue, invoice, stock, and low-stock summaries]
    ChooseTask -- Products --> ManageProducts[Create, edit, delete, search, and filter products]
    ChooseTask -- Invoices --> ManageInvoices[Create invoices, update status, and download PDF]
    ChooseTask -- Public store --> StoreSettings[/Configure public catalog and share shop link/]
    ChooseTask -- AI advisor --> AiAdvisor[Analyze business data and ask AI questions]
    ChooseTask -- Profile --> ProfileSettings[Update shop profile, logo, currency, and invoice footer]

    ViewMetrics --> ContinueWork{Continue working?}
    ManageProducts --> ProductDb[(Products and categories)]
    ManageInvoices --> InvoiceDb[(Invoices, invoice items, customers)]
    StoreSettings --> PublicOutput[/Public shop page by shop slug/]
    AiAdvisor --> InsightDb[(AI insights and chat history)]
    ProfileSettings --> SettingDb[(User and settings)]

    ProductDb --> ContinueWork
    InvoiceDb --> ContinueWork
    PublicOutput --> ContinueWork
    InsightDb --> ContinueWork
    SettingDb --> ContinueWork

    ContinueWork -- Yes --> Dashboard
    ContinueWork -- No --> Logout[Logout]
    Logout --> End([End])
```

## Notes

- Business modules are blocked until `accountStatus` is `ACTIVE` and `approvalStatus` is `APPROVED`.
- Registration is step 1. The shop application is step 2 and requires business information, a shop logo, and a verification document.
- If changes are requested, the shop owner can edit and resubmit the application.
- If the shop is declined or suspended, the owner cannot access protected business tools.
