import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'my';

const burmese: Record<string, string> = {
  'Overview': 'အနှစ်ချုပ်', 'Products': 'ကုန်ပစ္စည်းများ', 'Invoices': 'ဘောင်ချာများ', 'AI Advisor': 'AI အကြံပေး', 'Climbio Chat': 'Climbio Chat',
  'Public store': 'အများမြင်ဆိုင်', 'User manual': 'အသုံးပြုသူလမ်းညွှန်', 'Settings': 'ဆက်တင်များ', 'Workspace': 'လုပ်ငန်းခွင်', 'Log out': 'ထွက်ရန်',
  'View store': 'ဆိုင်ကြည့်ရန်', 'Expand sidebar': 'ဘေးဘား ချဲ့ရန်', 'Collapse sidebar': 'ဘေးဘား ချုံ့ရန်',
  'Close navigation': 'မီနူးပိတ်ရန်', 'Open navigation': 'မီနူးဖွင့်ရန်', 'Primary navigation': 'အဓိက မီနူး',
  'Switch to light mode': 'အလင်းမုဒ်သို့ ပြောင်းရန်', 'Switch to dark mode': 'အမှောင်မုဒ်သို့ ပြောင်းရန်',
  'Switch to Burmese': 'မြန်မာဘာသာသို့ ပြောင်းရန်', 'Switch to English': 'အင်္ဂလိပ်ဘာသာသို့ ပြောင်းရန်',
  'Built for growing shops': 'တိုးတက်နေသောဆိုင်များအတွက်',
  'Your business, organized in one': 'သင့်လုပ်ငန်းကို တစ်နေရာတည်းတွင်', 'calm workspace.': 'အဆင်ပြေစွာ စီမံပါ။',
  'Keep products, invoices, inventory, and your public store working together as your business grows.': 'ကုန်ပစ္စည်း၊ ဘောင်ချာ၊ စတော့နှင့် အများမြင်ဆိုင်ကို လုပ်ငန်းတိုးတက်လာသည်နှင့်အမျှ တစ်နေရာတည်းတွင် စီမံပါ။',
  'Simple inventory and sales tracking': 'ရိုးရှင်းသော စတော့နှင့် အရောင်းခြေရာခံမှု', 'A public catalog ready to share': 'မျှဝေရန်အဆင်သင့် ကုန်ပစ္စည်းစာရင်း',
  'Secure access to your business data': 'သင့်လုပ်ငန်းဒေတာကို လုံခြုံစွာ ဝင်ရောက်နိုင်ခြင်း', 'Already have an account?': 'အကောင့်ရှိပြီးသားလား?',
  'Donâ€™t have an account?': 'အကောင့်မရှိသေးဘူးလား?', 'Don’t have an account?': 'အကောင့်မရှိသေးဘူးလား?',
  'Sign in': 'ဝင်ရန်', 'Create account': 'အကောင့်ဖွင့်ရန်', 'Your workspace is protected with secure authentication.': 'သင့်လုပ်ငန်းခွင်ကို လုံခြုံသော အတည်ပြုစနစ်ဖြင့် ကာကွယ်ထားပါသည်။',
  'Dashboard': 'ပင်မစာမျက်နှာ', 'Sales': 'အရောင်း', 'Inventory': 'စတော့', 'Profile': 'ကိုယ်ရေးအချက်အလက်',
  'Administration': 'စီမံခန့်ခွဲမှု', 'Applications': 'လျှောက်လွှာများ', 'Shops': 'ဆိုင်များ', 'Users': 'အသုံးပြုသူများ', 'Audit logs': 'စစ်ဆေးမှတ်တမ်းများ',
  'Platform': 'ပလက်ဖောင်း', 'Platform administration': 'ပလက်ဖောင်း စီမံခန့်ခွဲမှု', 'Pending applications': 'စောင့်ဆိုင်းနေသော လျှောက်လွှာများ', 'Approved shops': 'အတည်ပြုပြီး ဆိုင်များ',
  'Changes requested': 'ပြင်ဆင်ရန် တောင်းဆိုထားသည်', 'Declined applications': 'ငြင်းပယ်ထားသော လျှောက်လွှာများ', 'Suspended shops': 'ရပ်ဆိုင်းထားသော ဆိုင်များ',
  'Review shop applications and platform activity.': 'ဆိုင်လျှောက်လွှာများနှင့် ပလက်ဖောင်းလုပ်ဆောင်မှုများကို စစ်ဆေးပါ။', 'Recent applications': 'နောက်ဆုံး လျှောက်လွှာများ',
  'View all': 'အားလုံးကြည့်ရန်', 'Recent admin activity': 'နောက်ဆုံး စီမံခန့်ခွဲသူ လုပ်ဆောင်မှုများ', 'System': 'စနစ်', 'Administrator': 'စီမံခန့်ခွဲသူ',
  'Create product': 'ကုန်ပစ္စည်းဖန်တီးရန်', 'Create invoice': 'ဘောင်ချာဖန်တီးရန်', 'Save changes': 'ပြောင်းလဲမှုများ သိမ်းရန်',
  'Cancel': 'မလုပ်တော့ပါ', 'Delete': 'ဖျက်ရန်', 'Edit': 'ပြင်ရန်', 'Add product': 'ကုန်ပစ္စည်းထည့်ရန်',
  'Search products...': 'ကုန်ပစ္စည်းများ ရှာရန်...', 'Search invoices or customers...': 'ဘောင်ချာ သို့မဟုတ် ဝယ်ယူသူ ရှာရန်...',
  'Search invoices': 'ဘောင်ချာများ ရှာရန်', 'Sort invoices': 'ဘောင်ချာများ စီရန်', 'Status': 'အခြေအနေ', 'Date': 'ရက်စွဲ',
  'All': 'အားလုံး', 'All time': 'အချိန်အားလုံး', 'Today': 'ယနေ့', 'This week': 'ဤအပတ်', 'This month': 'ဤလ', 'Custom': 'စိတ်ကြိုက်', 'From': 'မှ', 'To': 'အထိ',
  'Newest first': 'အသစ်ဆုံး အရင်', 'Oldest first': 'အဟောင်းဆုံး အရင်', 'Highest amount': 'ပမာဏ အများဆုံး', 'Lowest amount': 'ပမာဏ အနည်းဆုံး',
  'Invoice ID': 'ဘောင်ချာ အမှတ်', 'Customer': 'ဝယ်ယူသူ', 'Items': 'ပစ္စည်းများ', 'Total': 'စုစုပေါင်း', 'Actions': 'လုပ်ဆောင်ချက်များ',
  'Total invoices': 'ဘောင်ချာ စုစုပေါင်း', 'Paid invoices': 'ပေးချေပြီး ဘောင်ချာများ', 'Pending / Draft': 'စောင့်ဆိုင်း / မူကြမ်း', 'Total sales amount': 'အရောင်းပမာဏ စုစုပေါင်း',
  'No invoices yet': 'ဘောင်ချာ မရှိသေးပါ', 'No matching invoices': 'ကိုက်ညီသော ဘောင်ချာ မရှိပါ', 'No phone': 'ဖုန်းနံပါတ် မရှိပါ',
  'Loading invoices': 'ဘောင်ချာများ ဖွင့်နေသည်', 'Loading products': 'ကုန်ပစ္စည်းများ ဖွင့်နေသည်', 'Loading...': 'ဖွင့်နေသည်...',
  'PAID': 'ပေးချေပြီး', 'PENDING': 'စောင့်ဆိုင်းနေသည်', 'PROCESSING': 'ပြင်ဆင်နေသည်', 'SHIPPED': 'ပို့ဆောင်ပြီး', 'DELIVERED': 'လက်ခံရရှိပြီး', 'READY_FOR_PICKUP': 'လာယူရန်အသင့်ဖြစ်သည်', 'PICKED_UP': 'လာယူပြီး', 'CANCELLED': 'ပယ်ဖျက်ပြီး',
  'Update status': 'အခြေအနေပြောင်းရန်', 'Updating...': 'ပြောင်းလဲနေသည်...', 'Download PDF': 'PDF ဒေါင်းလုဒ်လုပ်ရန်', 'Preparing...': 'ပြင်ဆင်နေသည်...',
  'Invoice status updated': 'ဘောက်ချာအခြေအနေ ပြောင်းပြီးပါပြီ', 'Status could not be updated': 'အခြေအနေကို မပြောင်းနိုင်ပါ', 'Please try again.': 'ထပ်မံကြိုးစားပါ။',
  'Product name': 'ကုန်ပစ္စည်းအမည်', 'Description': 'ဖော်ပြချက်', 'Price': 'ဈေးနှုန်း', 'Quantity': 'အရေအတွက်', 'Category': 'အမျိုးအစား',
  'Customer name': 'ဝယ်ယူသူအမည်', 'Customer phone': 'ဝယ်ယူသူ ဖုန်းနံပါတ်', 'Notes': 'မှတ်ချက်များ',
  'Email address': 'အီးမေးလ်လိပ်စာ', 'Password': 'စကားဝှက်', 'Name': 'အမည်', 'Shop name': 'ဆိုင်အမည်',
  'Welcome back': 'ပြန်လည်ကြိုဆိုပါသည်', 'Sign in to your account': 'သင့်အကောင့်သို့ ဝင်ရန်', 'Create your account': 'သင့်အကောင့် ဖန်တီးရန်',
  'AI business advisor': 'AI လုပ်ငန်းအကြံပေး', 'Ask anything about your business': 'သင့်လုပ်ငန်းအကြောင်း မေးမြန်းနိုင်ပါသည်',
  'Send': 'ပို့ရန်', 'Close': 'ပိတ်ရန်', 'Back': 'နောက်သို့', 'Continue': 'ဆက်လုပ်ရန်', 'Required': 'လိုအပ်သည်',
  'Bar': 'တိုင်', 'Line': 'လိုင်း', 'Area': 'ဧရိယာ', 'Revenue': 'ဝင်ငွေ',
  'Last 7 days': 'နောက်ဆုံး ၇ ရက်', 'Last 30 days': 'နောက်ဆုံး ၃၀ ရက်', 'Last 6 months': 'နောက်ဆုံး ၆ လ',
  'Sales overview': 'အရောင်းအနှစ်ချုပ်', 'Sales chart type': 'အရောင်းဇယား အမျိုးအစား', 'Sales chart range': 'အရောင်းဇယား ကာလ',
  'Inventory levels': 'စတော့အဆင့်များ', 'Stock': 'စတော့', 'Low': 'နည်းသည်', 'Healthy': 'ကောင်းမွန်သည်',
  'Business summary': 'လုပ်ငန်းအနှစ်ချုပ်', 'Product view': 'ကုန်ပစ္စည်း မြင်ကွင်း',
  'Stock on hand': 'လက်ကျန်စတော့', 'Low stock': 'စတော့နည်းသည်', 'Items in your catalog': 'သင့်စာရင်းရှိ ကုန်ပစ္စည်းများ',
  'Units ready to sell': 'ရောင်းချရန် အသင့်ရှိသော အရေအတွက်', 'Products needing attention': 'ဂရုပြုရန် လိုအပ်သော ကုန်ပစ္စည်းများ',
  'Total from paid invoices': 'ပေးချေပြီးသော ဘောင်ချာများမှ စုစုပေါင်း', 'Paid invoice revenue for': 'ပေးချေပြီး ဘောင်ချာ ဝင်ငွေ -',
  'last 7 days': 'နောက်ဆုံး ၇ ရက်', 'last 30 days': 'နောက်ဆုံး ၃၀ ရက်', 'last 6 months': 'နောက်ဆုံး ၆ လ',
  'Ranked stock position by product': 'ကုန်ပစ္စည်းအလိုက် စတော့အဆင့်',
  'Product management': 'ကုန်ပစ္စည်း စီမံခန့်ခွဲမှု', 'Manage products, prices, visibility, and stock in one place.': 'ကုန်ပစ္စည်း၊ ဈေးနှုန်း၊ မြင်နိုင်မှုနှင့် စတော့ကို တစ်နေရာတည်းတွင် စီမံပါ။',
  'Total stock quantity': 'စတော့အရေအတွက် စုစုပေါင်း', 'Low stock items': 'စတော့နည်းသော ကုန်ပစ္စည်းများ', 'Out of stock items': 'စတော့ကုန်သော ကုန်ပစ္စည်းများ',
  'Recently added': 'မကြာသေးမီက ထည့်သွင်းထားသော', 'Product name A–Z': 'ကုန်ပစ္စည်းအမည် A–Z', 'Product name Z–A': 'ကုန်ပစ္စည်းအမည် Z–A',
  'Highest price': 'ဈေးနှုန်း အမြင့်ဆုံး', 'Lowest price': 'ဈေးနှုန်း အနိမ့်ဆုံး', 'Highest stock': 'စတော့ အများဆုံး', 'Lowest stock': 'စတော့ အနည်းဆုံး',
  'Low stock threshold': 'စတော့နည်းသတ်မှတ်ချက်', 'List': 'စာရင်း', 'Grid': 'ကွက်များ',
  'Business intelligence': 'လုပ်ငန်းဆိုင်ရာ အချက်အလက်', 'Climbio AI Advisor': 'Climbio AI အကြံပေး',
  'Get practical insights from your sales, products, inventory, and customers.': 'သင့်အရောင်း၊ ကုန်ပစ္စည်း၊ စတော့နှင့် ဝယ်ယူသူများမှ အသုံးဝင်သော အချက်အလက်များကို ရယူပါ။',
  'Analyze My Business': 'ကျွန်ုပ်၏လုပ်ငန်းကို သုံးသပ်ရန်', 'Your business analysis is ready when you are': 'သင့်လုပ်ငန်း သုံးသပ်ချက်ကို အဆင်သင့် ပြုလုပ်နိုင်ပါသည်',
  'Climbio will securely analyze your shop records and prepare a practical English business report. Your API key stays on the server.': 'Climbio သည် သင့်ဆိုင်မှတ်တမ်းများကို လုံခြုံစွာ သုံးသပ်ပြီး အသုံးဝင်သော လုပ်ငန်းအစီရင်ခံစာကို ပြုလုပ်ပေးပါမည်။ သင့် API key ကို ဆာဗာပေါ်တွင် လုံခြုံစွာ သိမ်းဆည်းထားပါသည်။',
  'Ask Climbio AI': 'Climbio AI ကို မေးမြန်းရန်', 'Get advice based on your actual business data.': 'သင့်လုပ်ငန်းဒေတာအမှန်အပေါ် အခြေခံသော အကြံဉာဏ်ကို ရယူပါ။',
  'Reviewing your business data': 'သင့်လုပ်ငန်းဒေတာကို သုံးသပ်နေသည်', 'Analyzing sales, products, stock, and customer patterns…': 'အရောင်း၊ ကုန်ပစ္စည်း၊ စတော့နှင့် ဝယ်ယူသူပုံစံများကို သုံးသပ်နေသည်…',
  'Business Overview': 'လုပ်ငန်းအနှစ်ချုပ်', 'Based on current Climbio records': 'လက်ရှိ Climbio မှတ်တမ်းများအပေါ် အခြေခံသည်',
  'AI Insights': 'AI အချက်အလက်များ', 'Recommendations': 'အကြံပြုချက်များ', 'Items needing attention': 'ဂရုပြုရန် လိုအပ်သော အရာများ',
  'Low or out of stock': 'စတော့နည်း သို့မဟုတ် စတော့ကုန်', 'Stock levels look healthy.': 'စတော့အဆင့်များ ကောင်းမွန်ပါသည်။',
  'Top products': 'ရောင်းအားကောင်းသော ကုန်ပစ္စည်းများ', 'Not enough paid sales data yet.': 'ပေးချေပြီးသော အရောင်းဒေတာ မလုံလောက်သေးပါ။',
  'Ask a question about your business': 'သင့်လုပ်ငန်းအကြောင်း မေးခွန်းမေးပါ', 'Climbio will use your sales and inventory records to prepare an answer.': 'Climbio သည် သင့်အရောင်းနှင့် စတော့မှတ်တမ်းများကို အသုံးပြု၍ အဖြေပြုလုပ်ပေးပါမည်။',
  'Review sales history, customer details, and payment status.': 'အရောင်းမှတ်တမ်း၊ ဝယ်ယူသူအသေးစိတ်နှင့် ပေးချေမှုအခြေအနေကို စစ်ဆေးပါ။',
  'All statuses': 'အခြေအနေအားလုံး', 'Paid': 'ပေးချေပြီး', 'Draft': 'မူကြမ်း', 'Sent': 'ပို့ပြီး', 'Overdue': 'ငွေပေးချေရန်ကျော်လွန်', 'Cancelled': 'ပယ်ဖျက်ပြီး',
  'List view': 'စာရင်းမြင်ကွင်း', 'Grid view': 'ကွက်မြင်ကွင်း', 'Filter by category': 'အမျိုးအစားအလိုက် စစ်ရန်',
  'Filter by stock': 'စတော့အလိုက် စစ်ရန်', 'Sort products': 'ကုန်ပစ္စည်းများ စီရန်',
  'All categories': 'အမျိုးအစားအားလုံး', 'All stock': 'စတော့အားလုံး', 'In Stock': 'စတော့ရှိသည်', 'Low Stock': 'စတော့နည်းသည်', 'Out of Stock': 'စတော့ကုန်သည်',
};

const landingBurmese: Record<string, string> = {
  'Product': 'ထုတ်ကုန်', 'Workflow': 'လုပ်ငန်းစဉ်', 'AI': 'AI', 'Security': 'လုံခြုံရေး', 'Account': 'အကောင့်', 'Explore': 'လေ့လာရန်',
  'Main navigation': 'ပင်မလမ်းညွှန်', 'Climbio home': 'Climbio ပင်မစာမျက်နှာ', 'Open navigation menu': 'လမ်းညွှန်မီနူးဖွင့်ရန်', 'Close navigation menu': 'လမ်းညွှန်မီနူးပိတ်ရန်',
  'Get started': 'စတင်အသုံးပြုရန်', 'SMARTER TOOLS FOR GROWING SHOPS': 'တိုးတက်နေသောဆိုင်များအတွက် စမတ်ကျသောကိရိယာများ',
  'One workspace to run': 'လုပ်ငန်းတစ်ခုလုံးကို စီမံရန်', 'your': 'သင့်', 'whole business.': 'လုပ်ငန်းခွင်တစ်ခုတည်း။',
  'Manage products, inventory, invoices, sales, your public store, and AI-powered business guidance without switching between multiple tools.': 'ထုတ်ကုန်၊ စတော့၊ ဘောင်ချာ၊ အရောင်း၊ အများမြင်ဆိုင်နှင့် AI လုပ်ငန်းအကြံပြုချက်များကို ကိရိယာများစွာ ပြောင်းသုံးစရာမလိုဘဲ စီမံပါ။',
  'Start your workspace': 'လုပ်ငန်းခွင် စတင်ရန်', 'Explore how it works': 'လုပ်ဆောင်ပုံ လေ့လာရန်', 'Secure setup': 'လုံခြုံသော စတင်တပ်ဆင်မှု', 'Admin-reviewed shops': 'စီမံခန့်ခွဲသူ စစ်ဆေးထားသောဆိုင်များ', 'Built for growing SMEs': 'တိုးတက်နေသော SME များအတွက်',
  'Climbio workspace': 'Climbio လုပ်ငန်းခွင်', 'Store': 'ဆိုင်', 'AI Chat': 'AI စကားပြော', 'Business overview': 'လုပ်ငန်းအနှစ်ချုပ်', 'Good morning, Shop Owner': 'မင်္ဂလာနံနက်ခင်းပါ၊ ဆိုင်ပိုင်ရှင်', 'Demo workspace': 'နမူနာလုပ်ငန်းခွင်',
  'Sales performance': 'အရောင်းစွမ်းဆောင်ရည်', 'Low Stock': 'စတော့နည်း', 'products need attention': 'ထုတ်ကုန်များ စစ်ဆေးရန်လိုအပ်သည်', 'AI Recommendation': 'AI အကြံပြုချက်', 'Restock your best-selling item this week.': 'ယခုအပတ်တွင် ရောင်းအားအကောင်းဆုံးပစ္စည်းကို စတော့ပြန်ဖြည့်ပါ။', 'Low stock': 'စတော့နည်း', 'Invoice paid': 'ဘောင်ချာ ပေးချေပြီး',
  'Everything your shop needs,': 'သင့်ဆိုင်လိုအပ်သမျှကို', 'working together.': 'တစ်စုတစ်စည်းတည်း အသုံးပြုပါ။', 'No disconnected spreadsheets, invoice apps, product lists, and business tools.': 'သီးခြား spreadsheet၊ ဘောင်ချာ app၊ ထုတ်ကုန်စာရင်းနှင့် လုပ်ငန်းကိရိယာများ မလိုတော့ပါ။',
  'Inventory & Products': 'စတော့နှင့် ထုတ်ကုန်များ', 'Manage products, categories, pricing, stock levels, and images from one organized inventory.': 'ထုတ်ကုန်၊ အမျိုးအစား၊ ဈေးနှုန်း၊ စတော့ပမာဏနှင့် ပုံများကို စနစ်တကျ တစ်နေရာတည်းမှ စီမံပါ။',
  'Stock': 'စတော့', 'Category': 'အမျိုးအစား', 'Create professional invoices, track status, and generate PDF documents.': 'ပရော်ဖက်ရှင်နယ် ဘောင်ချာများ ဖန်တီး၊ အခြေအနေခြေရာခံပြီး PDF ထုတ်ယူပါ။', '3 invoice items': 'ဘောင်ချာပစ္စည်း ၃ ခု',
  'Business Overview': 'လုပ်ငန်းအနှစ်ချုပ်', 'See sales performance and key shop metrics without digging through spreadsheets.': 'Spreadsheet များ ရှာဖွေစရာမလိုဘဲ အရောင်းစွမ်းဆောင်ရည်နှင့် အဓိကဆိုင်အချက်အလက်များကို ကြည့်ပါ။',
  'Public Store': 'အများမြင်ဆိုင်', 'Turn your approved shop into a shareable public product catalog.': 'အတည်ပြုပြီးသောဆိုင်ကို မျှဝေနိုင်သည့် အများမြင်ထုတ်ကုန်စာရင်းအဖြစ် ပြောင်းပါ။', 'Turn real shop data into practical recommendations.': 'ဆိုင်ဒေတာအစစ်မှ လက်တွေ့အသုံးဝင်သော အကြံပြုချက်များ ရယူပါ။',
  'Ask questions about your business using your own shop context.': 'သင့်ဆိုင်အချက်အလက်များကို အသုံးပြု၍ လုပ်ငန်းအကြောင်း မေးမြန်းပါ။', 'Which products should I restock?': 'ဘယ်ထုတ်ကုန်တွေကို စတော့ပြန်ဖြည့်သင့်သလဲ။',
  'Connected workflow': 'ချိတ်ဆက်ထားသော လုပ်ငန်းစဉ်', 'Your business data should work together.': 'သင့်လုပ်ငန်းဒေတာများ အတူတကွ လုပ်ဆောင်သင့်သည်။', 'Every product, invoice, and sale contributes to a clearer view of your business.': 'ထုတ်ကုန်၊ ဘောင်ချာနှင့် အရောင်းတိုင်းက သင့်လုပ်ငန်းကို ပိုမိုရှင်းလင်းစွာ မြင်နိုင်စေသည်။', 'Invoice': 'ဘောင်ချာ', 'AI Insight': 'AI သုံးသပ်ချက်', 'Customers': 'ဖောက်သည်များ',
  'Explore the product': 'ထုတ်ကုန်ကို လေ့လာရန်', 'Built around the way your shop works.': 'သင့်ဆိုင်၏ လုပ်ဆောင်ပုံနှင့် ကိုက်ညီစွာ တည်ဆောက်ထားသည်။', 'Choose a module to see how Climbio keeps daily work focused and connected.': 'နေ့စဉ်လုပ်ငန်းများကို Climbio က မည်သို့ စုစည်းချိတ်ဆက်ပေးသည်ကို ကြည့်ရန် ကဏ္ဍတစ်ခု ရွေးပါ။', 'Climbio modules': 'Climbio ကဏ္ဍများ',
  'See revenue, sales trends, and business health at a glance.': 'ဝင်ငွေ၊ အရောင်းလမ်းကြောင်းနှင့် လုပ်ငန်းအခြေအနေကို အလွယ်တကူ ကြည့်ပါ။', 'Organize products, categories, pricing, and stock.': 'ထုတ်ကုန်၊ အမျိုးအစား၊ ဈေးနှုန်းနှင့် စတော့ကို စုစည်းပါ။', 'Create professional invoices and follow their status.': 'ပရော်ဖက်ရှင်နယ် ဘောင်ချာများ ဖန်တီးပြီး အခြေအနေကို စောင့်ကြည့်ပါ။', 'Present active products in a customer-friendly catalog.': 'ရောင်းချနေသောထုတ်ကုန်များကို ဖောက်သည်အဆင်ပြေသည့် စာရင်းဖြင့် ပြပါ။',
  'Products & Inventory': 'ထုတ်ကုန်နှင့် စတော့', '128 products across 8 categories': 'အမျိုးအစား ၈ ခုမှ ထုတ်ကုန် ၁၂၈ ခု', 'Invoice Management': 'ဘောင်ချာ စီမံခန့်ခွဲမှု', 'Track every invoice from draft to paid': 'မူကြမ်းမှ ပေးချေပြီးအထိ ဘောင်ချာတိုင်းကို ခြေရာခံပါ', 'Public storefront preview': 'အများမြင်ဆိုင် အစမ်းမြင်ကွင်း', 'Business Dashboard': 'လုပ်ငန်း ဒက်ရှ်ဘုတ်', 'Your shop performance in one clear view': 'သင့်ဆိုင်စွမ်းဆောင်ရည်ကို တစ်နေရာတည်းတွင် ရှင်းလင်းစွာ ကြည့်ပါ',
  'Simple and secure onboarding': 'ရိုးရှင်းလုံခြုံသော စတင်အသုံးပြုမှု', 'From signup to your business workspace.': 'စာရင်းသွင်းခြင်းမှ သင့်လုပ်ငန်းခွင်အထိ။', 'Register as a shop owner.': 'ဆိုင်ပိုင်ရှင်အဖြစ် စာရင်းသွင်းပါ။', 'Submit your shop': 'ဆိုင်အချက်အလက် ပေးပို့ပါ', 'Provide the basic information required for platform review.': 'ပလက်ဖောင်းစစ်ဆေးရန် လိုအပ်သော အခြေခံအချက်အလက်များ ပေးပါ။', 'Admin review': 'စီမံခန့်ခွဲသူ စစ်ဆေးမှု', 'Climbio reviews the application. If changes are requested, update and resubmit.': 'Climbio က လျှောက်လွှာကို စစ်ဆေးပါမည်။ ပြင်ဆင်ရန် တောင်းဆိုပါက ပြင်ပြီး ပြန်လည်ပေးပို့ပါ။', 'Approval required': 'အတည်ပြုချက် လိုအပ်သည်', 'Start managing': 'စတင်စီမံရန်', 'After approval, access inventory, invoices, storefront, dashboard, and AI tools.': 'အတည်ပြုပြီးနောက် စတော့၊ ဘောင်ချာ၊ အများမြင်ဆိုင်၊ ဒက်ရှ်ဘုတ်နှင့် AI ကိရိယာများကို အသုံးပြုပါ။',
  'AI business intelligence': 'AI လုပ်ငန်းသုံးသပ်ချက်', 'Your data tells a story.': 'သင့်ဒေတာက အခြေအနေကို ဖော်ပြသည်။', 'Climbio helps you understand it.': 'Climbio က နားလည်အောင် ကူညီပေးသည်။', "Climbio's AI tools use your sales and inventory context to surface practical insights and answer business questions.": 'Climbio AI က သင့်အရောင်းနှင့် စတော့အချက်အလက်များကို အသုံးပြု၍ လက်တွေ့ကျသော သုံးသပ်ချက်များနှင့် လုပ်ငန်းမေးခွန်းအဖြေများ ပေးသည်။', 'Based on your current Climbio records': 'လက်ရှိ Climbio မှတ်တမ်းများအပေါ် အခြေခံသည်', 'What should I restock this week?': 'ဒီအပတ် ဘာတွေ စတော့ပြန်ဖြည့်သင့်သလဲ။', 'Based on recent sales and current stock, these products need attention:': 'လတ်တလောအရောင်းနှင့် လက်ရှိစတော့အရ ဤထုတ်ကုန်များကို စစ်ဆေးရန်လိုသည်။', 'High priority': 'အရေးကြီးဆုံး', 'Restock Product A': 'ထုတ်ကုန် A ကို စတော့ပြန်ဖြည့်ပါ', 'Opportunity': 'အခွင့်အလမ်း', 'Product B has strong sales momentum': 'ထုတ်ကုန် B အရောင်းတိုးတက်နေသည်', 'Watch': 'စောင့်ကြည့်ရန်', 'Product C stock is moving slowly': 'ထုတ်ကုန် C စတော့ ရောင်းနှေးနေသည်',
  'Public storefront': 'အများမြင်ဆိုင်', 'Your products deserve more than a social media post.': 'သင့်ထုတ်ကုန်များကို လူမှုကွန်ရက်ပို့စ်ထက် ပိုကောင်းစွာ ပြသပါ။', 'Approved shops can publish a public storefront where customers can browse active products without creating an account.': 'အတည်ပြုပြီးသောဆိုင်များသည် ဖောက်သည်များ အကောင့်ဖွင့်စရာမလိုဘဲ ထုတ်ကုန်များ ကြည့်နိုင်သည့် အများမြင်ဆိုင်ကို ထုတ်ဝေနိုင်သည်။', 'Shareable shop link': 'မျှဝေနိုင်သော ဆိုင်လင့်ခ်', 'Product browsing': 'ထုတ်ကုန်များ ရှာဖွေကြည့်ရှုခြင်း', 'Active inventory visibility': 'ရောင်းချနေသော စတော့မြင်နိုင်မှု', 'Customer-friendly interface': 'ဖောက်သည်အသုံးပြုရလွယ်သော မျက်နှာပြင်', 'Public product catalog': 'အများမြင်ထုတ်ကုန်စာရင်း', 'Contact shop': 'ဆိုင်ကို ဆက်သွယ်ရန်', 'Search products': 'ထုတ်ကုန် ရှာရန်', 'View details': 'အသေးစိတ်ကြည့်ရန်',
  'Trust by design': 'ယုံကြည်မှုအတွက် တည်ဆောက်ထားသည်', 'Built around your business data.': 'သင့်လုပ်ငန်းဒေတာအတွက် တည်ဆောက်ထားသည်။', 'Practical protections help keep each business workspace appropriately controlled.': 'လက်တွေ့ကျသော ကာကွယ်မှုများဖြင့် လုပ်ငန်းခွင်တိုင်းကို သင့်လျော်စွာ ထိန်းချုပ်ထားသည်။', 'Secure authentication': 'လုံခြုံသော အကောင့်အတည်ပြုမှု', 'Protected account sessions and securely stored passwords.': 'အကောင့်အသုံးပြုမှုနှင့် စကားဝှက်များကို လုံခြုံစွာ ကာကွယ်သိမ်းဆည်းထားသည်။', 'Role-based access': 'တာဝန်အလိုက် အသုံးပြုခွင့်', 'Different users only access the parts of the platform they are allowed to use.': 'အသုံးပြုသူတိုင်းသည် မိမိခွင့်ပြုထားသော အပိုင်းများကိုသာ အသုံးပြုနိုင်သည်။', 'Approval controls': 'အတည်ပြုမှု ထိန်းချုပ်ချက်များ', 'Shop-owner access follows the platform review process.': 'ဆိုင်ပိုင်ရှင်အသုံးပြုခွင့်သည် ပလက်ဖောင်းစစ်ဆေးမှု လုပ်ငန်းစဉ်အတိုင်း ဖြစ်သည်။', 'Shop-level isolation': 'ဆိုင်အလိုက် ဒေတာခွဲခြားမှု', 'Business records remain associated with their own shop workspace.': 'လုပ်ငန်းမှတ်တမ်းများကို သက်ဆိုင်ရာဆိုင်လုပ်ငန်းခွင်နှင့်သာ ချိတ်ဆက်ထားသည်။',
  'Your business is already moving.': 'သင့်လုပ်ငန်းက ရှေ့ဆက်နေပါပြီ။', 'Give it a better system.': 'ပိုကောင်းသော စနစ်တစ်ခု ပေးလိုက်ပါ။', 'Bring products, invoices, sales insights, your public store, and AI guidance into one Climbio workspace.': 'ထုတ်ကုန်၊ ဘောင်ချာ၊ အရောင်းသုံးသပ်ချက်၊ အများမြင်ဆိုင်နှင့် AI အကြံပြုချက်များကို Climbio လုပ်ငန်းခွင်တစ်ခုတည်းတွင် စုစည်းပါ။', 'Smart business tools for growing SMEs.': 'တိုးတက်နေသော SME များအတွက် စမတ်ကျသော လုပ်ငန်းကိရိယာများ။',
  'WELCOME BACK': 'ပြန်လည်ကြိုဆိုပါသည်', 'Sign in to Climbio': 'Climbio သို့ ဝင်ရောက်ပါ', 'Enter your details to continue managing your business.': 'သင့်လုပ်ငန်းကို ဆက်လက်စီမံရန် အချက်အလက်များ ထည့်ပါ။', 'CREATE YOUR ACCOUNT': 'သင့်အကောင့် ဖန်တီးပါ', 'Start building your business workspace.': 'သင့်လုပ်ငန်းခွင်ကို စတင်တည်ဆောက်ပါ။', 'Close authentication form': 'အကောင့်ဖောင်ကို ပိတ်ရန်',
};

const translations = { ...burmese, ...landingBurmese };
const english = Object.fromEntries(Object.entries(translations).map(([source, translated]) => [translated, source]));

function translateText(value: string, language: Language) {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const core = value.slice(leading.length, value.length - trailing.length);
  if (!core) return value;
  const dictionary = language === 'my' ? translations : english;
  return `${leading}${dictionary[core] ?? core}${trailing}`;
}

type LanguageContextValue = { language: Language; toggleLanguage: () => void; translate: (value: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('climbio-language') === 'my' ? 'my' : 'en');

  useEffect(() => {
    localStorage.setItem('climbio-language', language);
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
    document.documentElement.dataset.language = language;

    const translateElement = (element: Element) => {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const value = element.getAttribute(attribute);
        const translated = value ? translateText(value, language) : value;
        if (value && translated && translated !== value) element.setAttribute(attribute, translated);
      }
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
          const translated = translateText(node.nodeValue, language);
          if (translated !== node.nodeValue) node.nodeValue = translated;
        }
        else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
      });
    };
    const root = document.getElementById('root');
    if (!root) return;
    translateElement(root);
    const observer = new MutationObserver((records) => records.forEach((record) => {
      if (record.type === 'characterData' && record.target.nodeValue) {
        const translated = translateText(record.target.nodeValue, language);
        if (translated !== record.target.nodeValue) record.target.nodeValue = translated;
      }
      record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
          const translated = translateText(node.nodeValue, language);
          if (translated !== node.nodeValue) node.nodeValue = translated;
        }
        if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
      });
    }));
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({
    language,
    toggleLanguage: () => setLanguage((current) => current === 'en' ? 'my' : 'en'),
    translate: (text: string) => translateText(text, language),
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
