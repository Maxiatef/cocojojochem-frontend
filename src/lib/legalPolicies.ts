export type LegalTextBlock = { type: "paragraph" | "heading2" | "heading3" | "heading4" | "listItem"; text: string };
export type LegalTableBlock = { type: "table"; rows: string[][] };
export type LegalBlock = LegalTextBlock | LegalTableBlock;

export type LegalPolicy = {
  slug: string;
  title: string;
  footerLabel: string;
  effectiveDate?: string;
  lastUpdated?: string | null;
  summary?: string;
  /**
   * Search-result copy. Kept separate from `summary`, which renders as the
   * lead paragraph on the page itself and reads differently from a snippet.
   */
  metaTitle?: string;
  metaDescription?: string;
  blocks: LegalBlock[];
};

export const legalPolicies = [
  {
    "slug": "privacy-policy",
    "title": "Privacy Policy",
    "footerLabel": "Privacy Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "August 11, 2026",
    "summary": "How COCOJOJO collects, uses, protects, and shares personal information across its website, orders, customer accounts, communications, analytics, advertising, and related services.",
    "metaTitle": "Privacy Policy — How We Handle Your Data",
    "metaDescription": "Read the COCOJOJO privacy policy. Learn how we collect, use and protect your personal data, your privacy rights, and how to contact our team.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC (\"COCO JOJO,\" \"Company,\" \"we,\" \"our,\" or \"us\") is committed to protecting your privacy, maintaining transparency regarding our data practices, and implementing commercially reasonable safeguards designed to protect personal information, confidential information, business information, operational information, commercial information, technical information, and all related data in our possession or control."
      },
      {
        "type": "paragraph",
        "text": "Specifically, this Privacy Policy explains how we collect, receive, process, analyze, infer, generate, use, disclose, share, transfer, retain, monitor, secure, store, record, combine, and otherwise handle information when you interact with our websites, ecommerce systems, wholesale systems, private label services, OEM/ODM services, contract manufacturing services, customer support systems, AI systems, communications, advertisements, social media accounts, trade shows, digital properties, operational systems, technologies, products, and related services - including all current and future technologies, applications, integrations, software, systems, platforms, tools, and operational activities."
      },
      {
        "type": "paragraph",
        "text": "BY ACCESSING OR USING OUR WEBSITES, PRODUCTS, SYSTEMS, OR SERVICES IN ANY WAY, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THIS PRIVACY POLICY AND OUR TERMS OF SERVICE."
      },
      {
        "type": "paragraph",
        "text": "If you do not agree to this Privacy Policy, you must immediately discontinue all use of our services, systems, and websites."
      },
      {
        "type": "heading2",
        "text": "1. WHO WE ARE & HOW TO CONTACT US"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC is a skincare, haircare, cosmetic manufacturing, wholesale raw ingredient, private label, white label, OEM, ODM, and contract manufacturing company headquartered in California, United States, operating since 2008 with over 11,000 proprietary formulas and seven operational facilities across Orange County, California."
      },
      {
        "type": "heading2",
        "text": "COCO JOJO LLC"
      },
      {
        "type": "paragraph",
        "text": "General Inquiries: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Privacy Officer / Privacy Requests: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Website: www.COCOJOJO.com"
      },
      {
        "type": "paragraph",
        "text": "Privacy Policy URL: www.COCOJOJO.com/privacy-policy"
      },
      {
        "type": "paragraph",
        "text": "In general, this Privacy Policy applies to all websites, applications, customer portals, ecommerce systems, digital properties, operational systems, software, communications, and services owned, operated, managed, licensed, controlled, or provided by COCO JOJO LLC, including all brands, sub-brands, and affiliated operations."
      },
      {
        "type": "heading2",
        "text": "2. INFORMATION WE COLLECT"
      },
      {
        "type": "paragraph",
        "text": "Generally, depending on your interactions with us, we may collect, receive, process, infer, generate, analyze, combine, store, monitor, record, or share information including but not limited to the following categories. This list is illustrative, not exhaustive, and includes all categories of information we may collect in connection with our business operations."
      },
      {
        "type": "heading3",
        "text": "2.1 Identifiers & Personal Information"
      },
      {
        "type": "listItem",
        "text": "Full legal name, preferred name, and business name"
      },
      {
        "type": "listItem",
        "text": "Billing address, shipping address, and mailing address"
      },
      {
        "type": "listItem",
        "text": "Email address and secondary email addresses"
      },
      {
        "type": "listItem",
        "text": "Telephone number, mobile number, and fax number"
      },
      {
        "type": "listItem",
        "text": "Business information including EIN, business type, and industry"
      },
      {
        "type": "listItem",
        "text": "Tax identification numbers and resale certificate information"
      },
      {
        "type": "listItem",
        "text": "Government-issued identification where required for compliance"
      },
      {
        "type": "listItem",
        "text": "Customer account credentials, usernames, and passwords (encrypted)"
      },
      {
        "type": "listItem",
        "text": "Digital signatures and clickwrap acceptance records"
      },
      {
        "type": "listItem",
        "text": "IP addresses and device identifiers associated with account creation"
      },
      {
        "type": "heading3",
        "text": "2.2 Commercial & Transaction Information"
      },
      {
        "type": "listItem",
        "text": "Products viewed, considered, added to cart, wishlisted, and purchased"
      },
      {
        "type": "listItem",
        "text": "Complete purchase history, order history, and transaction records"
      },
      {
        "type": "listItem",
        "text": "Payment history, invoice records, and billing records"
      },
      {
        "type": "listItem",
        "text": "Refund requests, exchange requests, dispute records, and chargeback records"
      },
      {
        "type": "listItem",
        "text": "Quote activity, sample requests, and product inquiry records"
      },
      {
        "type": "listItem",
        "text": "Manufacturing requests, private label project information, and formulation requests"
      },
      {
        "type": "listItem",
        "text": "Wholesale account information, Net 30 credit account information, and bank information"
      },
      {
        "type": "listItem",
        "text": "Contract manufacturing information and OEM/ODM project records"
      },
      {
        "type": "listItem",
        "text": "Product customization requests, custom formulation specifications, and artwork"
      },
      {
        "type": "listItem",
        "text": "Customer interactions, support history, and complaint records"
      },
      {
        "type": "listItem",
        "text": "Commercial preferences, product interests, and purchasing patterns"
      },
      {
        "type": "heading3",
        "text": "2.3 Technical, Device & Usage Information"
      },
      {
        "type": "paragraph",
        "text": "We automatically collect information including but not limited to:"
      },
      {
        "type": "listItem",
        "text": "IP addresses, geolocation data derived from IP, and approximate geographic region"
      },
      {
        "type": "listItem",
        "text": "Browser type, version, language settings, and browser configurations"
      },
      {
        "type": "listItem",
        "text": "Device type, device model, device identifiers, device characteristics, and operating system"
      },
      {
        "type": "listItem",
        "text": "Referral URLs, entry pages, exit pages, and navigation paths"
      },
      {
        "type": "listItem",
        "text": "Session identifiers, session duration, and session activity records"
      },
      {
        "type": "listItem",
        "text": "Cookie identifiers, pixel identifiers, SDK identifiers, and advertising identifiers"
      },
      {
        "type": "listItem",
        "text": "Website interactions, click activity, scroll behavior, and navigation activity"
      },
      {
        "type": "listItem",
        "text": "Mouse movements, hover activity, and form interaction data"
      },
      {
        "type": "listItem",
        "text": "Clickstream activity, page view history, and search activity on our websites"
      },
      {
        "type": "listItem",
        "text": "Website performance data, error reports, and technical diagnostics"
      },
      {
        "type": "listItem",
        "text": "Network information, internet service provider, and connection type"
      },
      {
        "type": "listItem",
        "text": "Communication metadata, device metadata, and behavioral information"
      },
      {
        "type": "listItem",
        "text": "Operational metrics, analytics information, and related technical data"
      },
      {
        "type": "heading3",
        "text": "2.4 Marketing, Advertising & Audience Information"
      },
      {
        "type": "listItem",
        "text": "Ad interactions, campaign engagement, and advertising response data"
      },
      {
        "type": "listItem",
        "text": "Email engagement including opens, clicks, and unsubscribe activity"
      },
      {
        "type": "listItem",
        "text": "SMS engagement and communication response data"
      },
      {
        "type": "listItem",
        "text": "Behavioral analytics, customer segmentation data, and audience information"
      },
      {
        "type": "listItem",
        "text": "Retargeting activity, attribution information, and conversion data"
      },
      {
        "type": "listItem",
        "text": "Marketing preferences, communication preferences, and opt-in/opt-out records"
      },
      {
        "type": "listItem",
        "text": "Audience matching information, lookalike audience data, and interest data"
      },
      {
        "type": "listItem",
        "text": "Advertising performance metrics, ROAS data, and campaign analytics"
      },
      {
        "type": "listItem",
        "text": "Influencer interaction data, affiliate activity, and referral source data"
      },
      {
        "type": "heading3",
        "text": "2.5 Sensitive Personal Information"
      },
      {
        "type": "paragraph",
        "text": "In limited circumstances, users may voluntarily provide information that may constitute sensitive personal information including but not limited to:"
      },
      {
        "type": "listItem",
        "text": "Product sensitivities, known allergies, and skin sensitivity information"
      },
      {
        "type": "listItem",
        "text": "Cosmetic complaints, adverse product reactions, and product concern reports"
      },
      {
        "type": "listItem",
        "text": "Photos, videos, or before-and-after images related to product use or reactions"
      },
      {
        "type": "listItem",
        "text": "Health-related cosmetic information voluntarily submitted in support requests"
      },
      {
        "type": "listItem",
        "text": "Bank account and routing numbers provided for Net 30 credit accounts"
      },
      {
        "type": "paragraph",
        "text": "We use sensitive personal information only for the specific purpose for which it was provided and for reasonably necessary operational, customer service, quality assurance, safety, legal, regulatory, fraud prevention, compliance, or security purposes. We do not use sensitive personal information to infer characteristics about individuals beyond what is reasonably necessary for these purposes."
      },
      {
        "type": "heading3",
        "text": "2.6 User Generated Content"
      },
      {
        "type": "listItem",
        "text": "Product reviews, ratings, comments, and testimonials"
      },
      {
        "type": "listItem",
        "text": "Before and after images, product photos, and user-submitted photographs"
      },
      {
        "type": "listItem",
        "text": "Social media tags, mentions, and user-submitted videos"
      },
      {
        "type": "listItem",
        "text": "Feedback, surveys, and product experience reports"
      },
      {
        "type": "heading3",
        "text": "2.7 Professional & Employment Information (B2B)"
      },
      {
        "type": "listItem",
        "text": "Job title, professional role, and organizational position"
      },
      {
        "type": "listItem",
        "text": "Company size, industry, and business type"
      },
      {
        "type": "listItem",
        "text": "Professional background and business qualifications where voluntarily provided"
      },
      {
        "type": "listItem",
        "text": "Employment application information for job applicants and contractor candidates"
      },
      {
        "type": "heading3",
        "text": "2.8 Inferences & Derived Information"
      },
      {
        "type": "listItem",
        "text": "Customer profiles derived from purchase behavior, browsing history, and preferences"
      },
      {
        "type": "listItem",
        "text": "Predictive scores, risk scores, and fraud probability assessments"
      },
      {
        "type": "listItem",
        "text": "Product recommendation profiles and interest-based audience segments"
      },
      {
        "type": "listItem",
        "text": "Creditworthiness inferences derived for Net 30 account evaluation purposes"
      },
      {
        "type": "heading2",
        "text": "3. HOW WE COLLECT INFORMATION"
      },
      {
        "type": "paragraph",
        "text": "In practice, we may collect information through methods including but not limited to:"
      },
      {
        "type": "listItem",
        "text": "Website forms, order and checkout systems, and account registration"
      },
      {
        "type": "listItem",
        "text": "Customer accounts, wholesale portals, and private label portals"
      },
      {
        "type": "listItem",
        "text": "Email, SMS, phone calls, video calls, and live chat communications"
      },
      {
        "type": "listItem",
        "text": "AI systems, chatbots, automated customer support systems, and virtual assistants"
      },
      {
        "type": "listItem",
        "text": "Social media platforms, advertising platforms, and influencer communications"
      },
      {
        "type": "listItem",
        "text": "Trade shows, industry events, in-person interactions, and physical forms"
      },
      {
        "type": "listItem",
        "text": "Sample requests, quotation requests, and product registration forms"
      },
      {
        "type": "listItem",
        "text": "Cookies, pixels, tracking technologies, session replay tools, and SDKs"
      },
      {
        "type": "listItem",
        "text": "Analytics systems, advertising systems, and fraud prevention systems"
      },
      {
        "type": "listItem",
        "text": "Third party service providers, data brokers, and business partners"
      },
      {
        "type": "listItem",
        "text": "Business credit reporting agencies for Net 30 credit evaluation"
      },
      {
        "type": "listItem",
        "text": "Publicly available commercial databases and professional networks"
      },
      {
        "type": "listItem",
        "text": "Affiliates, referral partners, and reseller networks"
      },
      {
        "type": "heading2",
        "text": "4. COOKIES, TRACKING TECHNOLOGIES & CONSENT"
      },
      {
        "type": "heading3",
        "text": "4.1 Types of Cookies and Tracking Technologies"
      },
      {
        "type": "paragraph",
        "text": "We may use cookies, pixels, tags, APIs, SDKs, scripts, local storage technologies, advertising technologies, analytics technologies, attribution technologies, session replay technologies, heat mapping technologies, behavioral monitoring technologies, device fingerprinting, and other similar tools for analytics, personalization, security, fraud prevention, advertising, customer experience optimization, and business operations."
      },
      {
        "type": "paragraph",
        "text": "Cookie categories:"
      },
      {
        "type": "listItem",
        "text": "Strictly Necessary Cookies: Required for core website functionality, security, order processing, and account authentication. These cannot be disabled without breaking essential features."
      },
      {
        "type": "listItem",
        "text": "Performance and Analytics Cookies: Help us understand website usage patterns to improve performance and user experience. Include analytics services, session analytics, and behavioral analytics."
      },
      {
        "type": "listItem",
        "text": "Functional Cookies: Remember your preferences, language settings, login status, and user interface choices."
      },
      {
        "type": "listItem",
        "text": "Advertising and Targeting Cookies: Used to deliver relevant advertising across platforms, measure ad campaign effectiveness, and build audience segments. Include third-party advertising providers Pixel, third-party technology providers Ads tags, social media platforms Pixel, marketplace service providers Pixel, email and SMS service providers, and related advertising technologies."
      },
      {
        "type": "heading3",
        "text": "4.2 Cookie Consent"
      },
      {
        "type": "paragraph",
        "text": "When you first visit our website, you must choose whether to accept all optional technologies, use essential technologies only, or manage categories individually before continuing. Strictly necessary technologies operate without consent. Analytics, advertising measurement, and personalization choices may be changed at any time."
      },
      {
        "type": "paragraph",
        "text": "Additionally, our Google tags use Advanced Consent Mode. Before a choice is made, and when optional storage is denied, consent signals remain denied and Google may receive limited cookieless measurement pings. These pings do not permit optional analytics or advertising cookies. When analytics consent is granted, we may use consent-aware server measurement as a backup for completed purchases; the measurement payload excludes names, email addresses, postal addresses, phone numbers, and payment credentials."
      },
      {
        "type": "paragraph",
        "text": "In addition, we maintain an anonymous consent receipt containing a random browser identifier, receipt identifier, policy version, category choices, Global Privacy Control status, choice source, and timestamp. You may withdraw optional consent through the Cookie Preference Center. Withdrawal updates future browser and server measurement and removes optional cookies where technically possible."
      },
      {
        "type": "paragraph",
        "text": "You may update your cookie preferences at any time through our cookie preference center on our website, or by adjusting browser settings. Note that disabling certain cookies may affect website functionality, personalization, and the relevance of advertising you see."
      },
      {
        "type": "heading3",
        "text": "4.3 Session Replay and Behavioral Monitoring"
      },
      {
        "type": "paragraph",
        "text": "Similarly, we may use session replay technologies, heat mapping, behavioral analytics, and diagnostic monitoring for operational analysis, fraud prevention, troubleshooting, website optimization, and customer experience improvement. These technologies may monitor, record, replay, analyze, and store mouse movements, scroll behavior, navigation activity, click interactions, session activity, and website functionality data. Sensitive information including payment details and passwords is masked where commercially reasonable."
      },
      {
        "type": "heading3",
        "text": "4.4 Advertising Technologies"
      },
      {
        "type": "paragraph",
        "text": "Additionally, we may use analytics services, third-party technology providers Ads, tag management tools, third-party technology providers Signals, third-party advertising providers Pixel, social media platforms Ads, social media platforms Ads, social media platforms Ads, marketplace service providers Advertising, email and SMS service providers, and related advertising, analytics, optimization, and attribution technologies. These may collect IP addresses, device identifiers, session behavior, website interactions, advertising interactions, purchase behavior, audience segmentation data, and attribution data for analytics, advertising optimization, audience creation, retargeting, conversion tracking, and marketing performance analysis."
      },
      {
        "type": "heading3",
        "text": "4.5 Do Not Track"
      },
      {
        "type": "paragraph",
        "text": "Some browsers transmit Do Not Track signals. Our websites do not currently respond to Do Not Track browser signals. California residents may use the opt-out mechanism in Section 11 to opt out of the sharing of personal information for behavioral advertising purposes."
      },
      {
        "type": "heading2",
        "text": "5. HOW WE USE YOUR INFORMATION"
      },
      {
        "type": "heading3",
        "text": "5.1 Transaction and Account Fulfillment"
      },
      {
        "type": "listItem",
        "text": "Processing, fulfilling, and managing orders, purchase requests, and quotations"
      },
      {
        "type": "listItem",
        "text": "Managing customer accounts, wholesale accounts, Net 30 credit accounts, and OEM/ODM projects"
      },
      {
        "type": "listItem",
        "text": "Processing payments, managing billing, evaluating credit applications, and conducting collections"
      },
      {
        "type": "listItem",
        "text": "Providing customer service, technical support, and order assistance"
      },
      {
        "type": "listItem",
        "text": "Communicating order status, shipping updates, account notifications, and product information"
      },
      {
        "type": "heading3",
        "text": "5.2 Manufacturing, Product Development & Quality Control"
      },
      {
        "type": "listItem",
        "text": "Manufacturing, formulating, and quality-controlling products to customer specifications"
      },
      {
        "type": "listItem",
        "text": "Developing custom formulations, private label products, and OEM/ODM products"
      },
      {
        "type": "listItem",
        "text": "Managing ingredient sourcing, supplier relationships, and supply chain operations"
      },
      {
        "type": "listItem",
        "text": "Conducting stability testing, quality assurance, and product compliance activities"
      },
      {
        "type": "heading3",
        "text": "5.3 Security, Fraud Prevention & Compliance"
      },
      {
        "type": "listItem",
        "text": "Preventing, detecting, investigating, and reporting fraud, abuse, and unauthorized access"
      },
      {
        "type": "listItem",
        "text": "Maintaining cybersecurity, system integrity, and physical security"
      },
      {
        "type": "listItem",
        "text": "Complying with all applicable laws, regulations, and legal obligations"
      },
      {
        "type": "listItem",
        "text": "Responding to legal requests, subpoenas, regulatory inquiries, and court orders"
      },
      {
        "type": "listItem",
        "text": "Enforcing our Terms of Service, Privacy Policy, and all other agreements"
      },
      {
        "type": "listItem",
        "text": "Protecting COCO JOJO LLC's rights, property, personnel, brands, and business operations"
      },
      {
        "type": "heading3",
        "text": "5.4 Marketing, Advertising & Communications"
      },
      {
        "type": "listItem",
        "text": "Sending marketing emails, SMS messages, and promotional communications with consent where required"
      },
      {
        "type": "listItem",
        "text": "Personalizing product recommendations, content, and advertising"
      },
      {
        "type": "listItem",
        "text": "Conducting surveys, feedback collection, and market research"
      },
      {
        "type": "listItem",
        "text": "Managing influencer partnerships, affiliate programs, and reseller communications"
      },
      {
        "type": "listItem",
        "text": "Running advertising campaigns on third-party technology providers, third-party advertising providers, social media platforms, marketplace service providers, and other platforms"
      },
      {
        "type": "heading3",
        "text": "5.5 AI Systems, Analytics & Business Intelligence"
      },
      {
        "type": "listItem",
        "text": "Training, improving, and operating AI-assisted customer service and operational systems"
      },
      {
        "type": "listItem",
        "text": "Generating business analytics, performance reports, and operational insights"
      },
      {
        "type": "listItem",
        "text": "Operating fraud detection, risk assessment, and creditworthiness evaluation systems"
      },
      {
        "type": "listItem",
        "text": "Improving product formulations and manufacturing processes based on aggregated data"
      },
      {
        "type": "listItem",
        "text": "Conducting market analysis, competitive intelligence, and strategic planning"
      },
      {
        "type": "heading3",
        "text": "5.6 Legal, Regulatory & Operational Purposes"
      },
      {
        "type": "listItem",
        "text": "Maintaining business records required by law, regulation, or contract"
      },
      {
        "type": "listItem",
        "text": "Supporting insurance claims, regulatory audits, and legal proceedings"
      },
      {
        "type": "listItem",
        "text": "Conducting due diligence for business transactions, partnerships, and investments"
      },
      {
        "type": "listItem",
        "text": "Any other purpose disclosed at the time of collection or with your consent"
      },
      {
        "type": "heading2",
        "text": "6. LEGAL BASIS FOR PROCESSING"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC processes personal information on the following legal bases, as applicable:"
      },
      {
        "type": "listItem",
        "text": "Contract performance: Processing necessary to fulfill orders, manage accounts, and deliver services"
      },
      {
        "type": "listItem",
        "text": "Legal obligation: Processing required to comply with applicable laws, regulations, and governmental requests"
      },
      {
        "type": "listItem",
        "text": "Legitimate interests: Processing for fraud prevention, security, business analytics, product improvement, and marketing where not overridden by your interests"
      },
      {
        "type": "listItem",
        "text": "Consent: Processing for advertising cookies, marketing communications, and sensitive information where required by law"
      },
      {
        "type": "listItem",
        "text": "Vital interests: Processing to protect the safety of individuals in emergency circumstances"
      },
      {
        "type": "paragraph",
        "text": "For California residents, processing is conducted pursuant to the CCPA and CPRA for the business and commercial purposes disclosed in Section 5."
      },
      {
        "type": "heading2",
        "text": "7. HOW WE SHARE INFORMATION"
      },
      {
        "type": "paragraph",
        "text": "We do not sell personal information for monetary consideration. We may share, disclose, transfer, or make available personal information in the following circumstances:"
      },
      {
        "type": "heading3",
        "text": "7.1 Service Providers and Vendors"
      },
      {
        "type": "paragraph",
        "text": "Specifically, we share personal information with third party service providers who assist us in operating our business under appropriate data processing agreements, including but not limited to:"
      },
      {
        "type": "listItem",
        "text": "Payment processors: payment service providers, payment service providers, ACH processors, and banking institutions"
      },
      {
        "type": "listItem",
        "text": "Shipping and logistics: domestic and international shipping carriers, freight carriers, and logistics providers"
      },
      {
        "type": "listItem",
        "text": "Cloud infrastructure and hosting: marketplace service providers Web Services, third-party technology providers Cloud, and related providers"
      },
      {
        "type": "listItem",
        "text": "CRM and marketing automation: email and SMS service providers, HubSpot, and similar platforms"
      },
      {
        "type": "listItem",
        "text": "Analytics providers: analytics services, and similar analytics services"
      },
      {
        "type": "listItem",
        "text": "Advertising platforms: third-party technology providers Ads, third-party advertising providers Ads, social media platforms Ads, marketplace service providers Advertising, and related networks"
      },
      {
        "type": "listItem",
        "text": "Fraud prevention and identity verification providers"
      },
      {
        "type": "listItem",
        "text": "Session replay and behavioral analytics providers"
      },
      {
        "type": "listItem",
        "text": "Legal, accounting, insurance, and professional service providers"
      },
      {
        "type": "listItem",
        "text": "Business credit reporting agencies for commercial credit evaluation"
      },
      {
        "type": "heading3",
        "text": "7.2 Advertising and Cross-Context Behavioral Advertising"
      },
      {
        "type": "paragraph",
        "text": "In addition, we may share certain identifiers - including hashed email addresses, cookie IDs, device identifiers, and browsing behavior data - with advertising platforms including third-party technology providers, third-party advertising providers, social media platforms, and marketplace service providers for targeted advertising and cross-context behavioral advertising. This sharing may constitute the 'sale' or 'sharing' of personal information under CPRA. California residents may opt out of this sharing using the mechanism described in Section 11."
      },
      {
        "type": "heading3",
        "text": "7.3 Business Transfers"
      },
      {
        "type": "paragraph",
        "text": "In the event of a merger, acquisition, sale of all or substantially all assets, reorganization, bankruptcy, or similar business transaction, personal information may be transferred to the acquiring or successor entity as a business asset, subject to applicable law. We will notify registered users of any such transfer via email or website notice."
      },
      {
        "type": "heading3",
        "text": "7.4 Legal Obligations and Rights Protection"
      },
      {
        "type": "paragraph",
        "text": "We may disclose personal information where we believe in good faith that disclosure is necessary to: comply with applicable law, regulation, or legal process; respond to subpoenas, court orders, or government requests; cooperate with law enforcement, regulatory authorities, or governmental agencies; investigate or prevent fraud or security threats; enforce our Terms of Service or other agreements; or protect the rights, safety, and property of COCO JOJO LLC, our employees, customers, or others."
      },
      {
        "type": "heading3",
        "text": "7.5 Affiliates and Related Entities"
      },
      {
        "type": "paragraph",
        "text": "Similarly, we may share personal information with COCO JOJO LLC affiliated companies, related brands, and subsidiary operations for purposes consistent with this Privacy Policy."
      },
      {
        "type": "heading3",
        "text": "7.6 Professional Advisors"
      },
      {
        "type": "paragraph",
        "text": "In addition, we may share personal information with attorneys, accountants, auditors, insurers, and other professional advisors in connection with legal advice, compliance, and business operations, subject to applicable professional confidentiality obligations."
      },
      {
        "type": "heading3",
        "text": "7.7 Aggregated and De-Identified Data"
      },
      {
        "type": "paragraph",
        "text": "Finally, we may share aggregated, anonymized, or de-identified data that cannot reasonably be used to identify you, for research, analytics, product development, industry reporting, or marketing purposes."
      },
      {
        "type": "heading2",
        "text": "8. DATA RETENTION SCHEDULE"
      },
      {
        "type": "paragraph",
        "text": "We retain personal information only for as long as necessary to fulfill the purposes described in this Policy, unless a longer retention period is required or permitted by law. The following schedule represents our general retention guidelines. Actual retention may be longer where required by legal hold, ongoing litigation, regulatory investigation, or contractual obligation."
      },
      {
        "type": "heading3",
        "text": "8.1 Retention Schedule by Category"
      },
      {
        "type": "listItem",
        "text": "Account and transaction records (orders, invoices, payments): 7 years following the last transaction - required for tax compliance, financial recordkeeping, and California commercial law obligations"
      },
      {
        "type": "listItem",
        "text": "Customer communications and support records: 3 years following last interaction - for dispute resolution, quality assurance, and legal defense"
      },
      {
        "type": "listItem",
        "text": "Net 30 credit account records and bank information: 7 years following account closure or last transaction - for financial compliance and collections purposes"
      },
      {
        "type": "listItem",
        "text": "Marketing consent, opt-in, and opt-out records: 5 years - to document compliance with marketing consent requirements"
      },
      {
        "type": "listItem",
        "text": "Cookie consent and preference records: 3 years - to document consent compliance"
      },
      {
        "type": "listItem",
        "text": "Fraud prevention and security logs: 3 years - for security monitoring and incident response"
      },
      {
        "type": "listItem",
        "text": "Website analytics and behavioral data: 26 months (analytics services default) to 3 years depending on tool"
      },
      {
        "type": "listItem",
        "text": "Session replay and heat mapping recordings: 12 months - for operational analysis and troubleshooting"
      },
      {
        "type": "listItem",
        "text": "AI system interaction logs: 3 years - for quality assurance, training improvement, and compliance"
      },
      {
        "type": "listItem",
        "text": "Legal hold data: Retained for the duration of any pending legal matter, regulatory investigation, or litigation plus a minimum of 3 years following resolution"
      },
      {
        "type": "listItem",
        "text": "Job applicant data (unsuccessful applicants): 2 years from application date"
      },
      {
        "type": "listItem",
        "text": "Employment and contractor records: Duration of engagement plus 7 years - for tax, labor law, and legal compliance"
      },
      {
        "type": "listItem",
        "text": "Regulatory compliance records (COAs, SDS, batch records): 7 years minimum - for FDA, FTC, and cosmetic industry compliance"
      },
      {
        "type": "listItem",
        "text": "User generated content, reviews, and testimonials: For the duration of our license and commercial use, unless deletion is requested"
      },
      {
        "type": "heading3",
        "text": "8.2 Deletion Procedures"
      },
      {
        "type": "paragraph",
        "text": "Subsequently, when personal information is no longer necessary and no legal retention basis exists, we delete, anonymize, or securely destroy it in accordance with our data retention schedule. Where complete deletion is not technically feasible (such as in certain backup systems), we isolate data and protect it from further processing until deletion is possible."
      },
      {
        "type": "heading2",
        "text": "9. INTERNATIONAL DATA TRANSFERS"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC is headquartered in the United States. If you access our services from outside the United States, your personal information will be transferred to, stored in, and processed in the United States, where data protection laws may differ from - and in some cases may be less protective than - the laws of your country or region."
      },
      {
        "type": "heading3",
        "text": "9.1 Transfers to the United States"
      },
      {
        "type": "paragraph",
        "text": "For users located in the European Economic Area (EEA), United Kingdom (UK), Switzerland, or other jurisdictions with restrictions on cross-border data transfers, we rely on the following legal mechanisms to authorize transfers to the United States:"
      },
      {
        "type": "listItem",
        "text": "Standard Contractual Clauses (SCCs) adopted by the European Commission, incorporated into our agreements with service providers where applicable"
      },
      {
        "type": "listItem",
        "text": "UK International Data Transfer Agreements (IDTAs) for UK data transfers where applicable"
      },
      {
        "type": "listItem",
        "text": "Adequacy decisions where applicable (e.g., jurisdictions recognized as providing adequate protection)"
      },
      {
        "type": "listItem",
        "text": "Your explicit consent to the transfer where no other mechanism applies"
      },
      {
        "type": "heading3",
        "text": "9.2 Third Party Service Provider Transfers"
      },
      {
        "type": "paragraph",
        "text": "Similarly, when we transfer personal information to third party service providers located outside the United States - including cloud providers, analytics platforms, advertising networks, and operational partners - we take commercially reasonable steps to ensure such providers maintain appropriate data protection standards. A list of key international service providers and applicable transfer mechanisms is available upon written request to support@cocojojo.com."
      },
      {
        "type": "heading3",
        "text": "9.3 International Customer Data"
      },
      {
        "type": "paragraph",
        "text": "For wholesale customers, distributors, and manufacturing clients located outside the United States, personal information is transferred to and processed in the United States as necessary to fulfill our contractual obligations. By entering into a commercial relationship with COCO JOJO LLC, international customers consent to such transfers."
      },
      {
        "type": "heading3",
        "text": "9.4 Contact for International Transfer Questions"
      },
      {
        "type": "paragraph",
        "text": "Finally, for questions about international data transfers, applicable safeguards, or to request information about specific transfer mechanisms, contact: support@cocojojo.com"
      },
      {
        "type": "heading2",
        "text": "10. AI SYSTEMS, AUTOMATED PROCESSING & COMMUNICATION MONITORING"
      },
      {
        "type": "heading3",
        "text": "10.1 AI and Automated Systems"
      },
      {
        "type": "paragraph",
        "text": "Notably, we may use AI systems, machine learning technologies, automated technologies, recommendation systems, fraud detection systems, customer support systems, operational monitoring systems, and related technologies for customer support, inquiry handling, fraud prevention, website optimization, marketing analysis, product recommendations, quality assurance, analytics, and business intelligence."
      },
      {
        "type": "paragraph",
        "text": "Users acknowledge that AI systems may generate incomplete, inaccurate, simulated, misleading, outdated, biased, or hallucinated outputs. All AI-generated information must be independently verified prior to reliance, manufacturing, regulatory submission, commercialization, medical use, or redistribution."
      },
      {
        "type": "heading3",
        "text": "10.2 Communication Monitoring and Recording"
      },
      {
        "type": "paragraph",
        "text": "Telephone calls, video calls, emails, SMS communications, AI interactions, live chat sessions, customer support communications, and related communications may be monitored, reviewed, analyzed, transcribed, or recorded for purposes including quality assurance, fraud prevention, security, compliance, dispute resolution, training, analytics, operational improvements, and business intelligence."
      },
      {
        "type": "paragraph",
        "text": "By communicating with COCO JOJO LLC through any channel, you consent to such monitoring and recording where permitted by applicable law, including under California Penal Code Section 632 (two-party consent). Where legally required, we will provide notice of recording at the start of a call or communication."
      },
      {
        "type": "heading3",
        "text": "10.3 Automated Decision-Making"
      },
      {
        "type": "paragraph",
        "text": "We may use automated systems for fraud scoring, credit risk evaluation, order approval, and similar purposes. Where automated decisions produce legal or similarly significant effects, users may contact support@cocojojo.com to request human review of the decision, an explanation of the decision logic, and reconsideration."
      },
      {
        "type": "heading2",
        "text": "11. CALIFORNIA PRIVACY RIGHTS - CCPA / CPRA"
      },
      {
        "type": "paragraph",
        "text": "This section applies to California residents and is provided pursuant to the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), effective January 1, 2023."
      },
      {
        "type": "heading3",
        "text": "11.1 Your California Privacy Rights"
      },
      {
        "type": "paragraph",
        "text": "California residents have the following rights:"
      },
      {
        "type": "paragraph",
        "text": "Right to Know (Access): You have the right to request that we disclose: (a) the categories of personal information we have collected about you; (b) the categories of sources from which personal information was collected; (c) the business or commercial purpose for collecting, selling, or sharing personal information; (d) the categories of third parties to whom we disclose personal information; and (e) the specific pieces of personal information we have collected about you."
      },
      {
        "type": "paragraph",
        "text": "Right to Delete: You have the right to request deletion of personal information we have collected about you, subject to applicable exceptions including: completing transactions; detecting security incidents; debugging errors; exercising free speech; complying with legal obligations; conducting research in the public interest; enabling internal uses consistent with your expectations; and other purposes permitted by CPRA."
      },
      {
        "type": "paragraph",
        "text": "Right to Correct: You have the right to request correction of inaccurate personal information we maintain about you, taking into account the nature of the information and its purpose."
      },
      {
        "type": "paragraph",
        "text": "Right to Opt-Out of Sale or Sharing: You have the right to opt out of the sale of personal information and the sharing of personal information for cross-context behavioral advertising. To exercise this right, see Section 11.5 below."
      },
      {
        "type": "paragraph",
        "text": "Right to Limit Use of Sensitive Personal Information: You have the right to request that we limit our use and disclosure of sensitive personal information to purposes necessary to provide the services you request or as otherwise permitted by CPRA."
      },
      {
        "type": "heading4",
        "text": "Non-Discrimination and Portability Rights"
      },
      {
        "type": "paragraph",
        "text": "Right to Non-Discrimination: You have the right not to receive discriminatory treatment for exercising any of the rights described in this section. We will not deny goods or services, charge different prices, provide different quality of service, or suggest you will receive a different level of service solely for exercising your privacy rights."
      },
      {
        "type": "paragraph",
        "text": "Right to Data Portability: You have the right to receive personal information you provided to us in a portable, usable format where technically feasible."
      },
      {
        "type": "heading3",
        "text": "11.2 How to Submit a Consumer Rights Request"
      },
      {
        "type": "paragraph",
        "text": "To submit a verifiable consumer request, you may contact us through any of the following methods:"
      },
      {
        "type": "listItem",
        "text": "Email: support@cocojojo.com (subject line: 'California Privacy Request - [Right You Are Exercising]')"
      },
      {
        "type": "paragraph",
        "text": "Additionally, your request must include: your full name, email address or other contact information, the specific right you are exercising, and sufficient information to verify your identity. We will acknowledge receipt of your request within ten (10) business days and provide a substantive response within forty-five (45) calendar days of receipt. Where reasonably necessary, we may extend the response period by an additional forty-five (45) calendar days, and we will notify you of any such extension."
      },
      {
        "type": "heading3",
        "text": "11.3 Verification Procedures"
      },
      {
        "type": "paragraph",
        "text": "In all cases, we will take reasonable steps to verify your identity before processing any consumer rights request. Verification may require you to provide: account login credentials, order confirmation numbers, the email address associated with your account, or other information that matches our records. For requests involving sensitive information or deletion, we may require stronger verification."
      },
      {
        "type": "paragraph",
        "text": "We cannot fulfill requests where we are unable to verify the requestor's identity. We will not fulfill requests submitted on behalf of another person unless the authorized agent procedures in Section 11.4 are followed."
      },
      {
        "type": "heading3",
        "text": "11.4 Authorized Agent Procedures"
      },
      {
        "type": "paragraph",
        "text": "You may designate an authorized agent to submit a consumer rights request on your behalf. To use an authorized agent, you must provide either: (a) written authorization signed by you designating the agent, or (b) a valid power of attorney executed pursuant to California Probate Code Sections 4000-4465. We may contact you directly to verify the request and confirm the agent's authorization. We may deny a request from an agent who cannot provide adequate proof of authorization."
      },
      {
        "type": "heading3",
        "text": "11.5 Do Not Sell or Share My Personal Information"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC does not sell personal information for monetary consideration. To the extent we share personal information with third party advertising partners through pixels, tracking technologies, or audience matching tools (as described in Section 4.4 and 7.2), California residents may opt out of such sharing."
      },
      {
        "type": "paragraph",
        "text": "To opt out of sharing personal information for cross-context behavioral advertising:"
      },
      {
        "type": "listItem",
        "text": "Email: support@cocojojo.com with subject line 'Do Not Sell or Share My Personal Information'"
      },
      {
        "type": "listItem",
        "text": "Manage cookie preferences through our cookie preference center on www.COCOJOJO.com"
      },
      {
        "type": "listItem",
        "text": "Use the Global Privacy Control (GPC) signal in your browser where technically supported"
      },
      {
        "type": "paragraph",
        "text": "Upon receiving a valid opt-out request, we will honor it within fifteen (15) business days and direct our service providers not to sell or share your personal information. Note that opting out of advertising data sharing may result in less relevant advertising but will not affect your ability to use our services."
      },
      {
        "type": "heading3",
        "text": "11.6 CPRA 12-Month Personal Information Disclosure"
      },
      {
        "type": "paragraph",
        "text": "During the preceding twelve (12) months, COCO JOJO LLC has collected, disclosed for business purposes, and/or shared the following categories of personal information:"
      },
      {
        "type": "listItem",
        "text": "Identifiers (names, email, phone, IP, account credentials) - Collected: Yes | Disclosed for business purposes: Yes (service providers) | Sold: No | Shared for advertising: Yes (hashed emails/identifiers with advertising platforms)"
      },
      {
        "type": "listItem",
        "text": "Commercial information (purchase history, transaction records, order data) - Collected: Yes | Disclosed for business purposes: Yes (payment processors, logistics) | Sold: No | Shared for advertising: Limited (purchase behavior with advertising platforms for attribution)"
      },
      {
        "type": "listItem",
        "text": "Internet or network activity (browsing, session data, clickstream) - Collected: Yes | Disclosed for business purposes: Yes (analytics, session replay providers) | Sold: No | Shared for advertising: Yes (with advertising platforms through pixels and tracking)"
      },
      {
        "type": "listItem",
        "text": "Geolocation data (approximate location from IP) - Collected: Yes | Disclosed for business purposes: Yes (analytics, fraud prevention) | Sold: No | Shared for advertising: Yes (region-based advertising targeting)"
      },
      {
        "type": "listItem",
        "text": "Professional or employment information (B2B customers: title, company) - Collected: Yes | Disclosed for business purposes: Yes (CRM, marketing automation) | Sold: No | Shared for advertising: Limited"
      },
      {
        "type": "listItem",
        "text": "Sensitive personal information (product sensitivities, health-related cosmetic information, bank account numbers for Net 30) - Collected: Limited | Disclosed for business purposes: Limited (customer service, credit evaluation) | Sold: No | Shared for advertising: No"
      },
      {
        "type": "listItem",
        "text": "Inferences (customer profiles, preference data) - Collected: Yes | Disclosed for business purposes: Yes (marketing automation, analytics) | Sold: No | Shared for advertising: Yes (audience segments with advertising platforms)"
      },
      {
        "type": "heading2",
        "text": "12. SHINE THE LIGHT (CALIFORNIA CIVIL CODE SECTION 1798.83)"
      },
      {
        "type": "paragraph",
        "text": "California Civil Code Section 1798.83 permits California customers to request information about the personal information COCO JOJO LLC has shared with third parties for their own direct marketing purposes during the preceding calendar year, including the categories of personal information shared and the names and addresses of those third parties."
      },
      {
        "type": "paragraph",
        "text": "To submit a Shine the Light request, email support@cocojojo.com with 'Shine the Light Request' in the subject line. We will respond within thirty (30) days of receiving a verifiable request."
      },
      {
        "type": "heading2",
        "text": "13. DATA SECURITY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC implements commercially reasonable and appropriate technical and organizational security measures designed to protect personal information against unauthorized access, disclosure, alteration, loss, or destruction. Our security measures include but are not limited to:"
      },
      {
        "type": "listItem",
        "text": "Encryption of data in transit using TLS/SSL and at rest where appropriate"
      },
      {
        "type": "listItem",
        "text": "Access controls, role-based permissions, and authentication requirements"
      },
      {
        "type": "listItem",
        "text": "Multi-factor authentication for administrative system access"
      },
      {
        "type": "listItem",
        "text": "Fraud detection, anomaly monitoring, and security event logging"
      },
      {
        "type": "listItem",
        "text": "Regular security assessments, penetration testing, and vendor security reviews"
      },
      {
        "type": "listItem",
        "text": "Employee training on data privacy, security practices, and phishing awareness"
      },
      {
        "type": "listItem",
        "text": "Incident response procedures and data breach response protocols"
      },
      {
        "type": "listItem",
        "text": "Physical security controls at operational facilities"
      },
      {
        "type": "paragraph",
        "text": "No method of transmission over the internet or method of electronic storage is completely secure. We cannot guarantee absolute security of any system, network, or transmission. COCO JOJO LLC disclaims liability for unauthorized access, cyberattacks, malware, ransomware, data breaches, interception, phishing, third party failures, or events beyond our reasonable control - subject to applicable law."
      },
      {
        "type": "heading2",
        "text": "14. DATA BREACH NOTIFICATION"
      },
      {
        "type": "paragraph",
        "text": "In the event of a security incident or data breach involving personal information, COCO JOJO LLC will respond in accordance with applicable legal requirements:"
      },
      {
        "type": "listItem",
        "text": "California notification: We will notify affected California residents in the most expedient time possible and without unreasonable delay, and will notify the California Attorney General if the breach affects more than 500 California residents, consistent with California Civil Code Sections 1798.29 and 1798.82."
      },
      {
        "type": "listItem",
        "text": "Regulatory notification: We will notify the California Privacy Protection Agency (CPPA) and other applicable regulators as required by the CPRA and related regulations."
      },
      {
        "type": "listItem",
        "text": "Federal notification: We will comply with applicable federal notification requirements including those under the FTC Act, HIPAA (if applicable), and sector-specific laws."
      },
      {
        "type": "listItem",
        "text": "International notification: For EU/UK data subjects, we will comply with GDPR and UK GDPR breach notification requirements including 72-hour notification to supervisory authorities where applicable."
      },
      {
        "type": "paragraph",
        "text": "Breach notifications will be provided via email to the address on file, notice on our website, or other appropriate methods. Notifications will include: the nature of the breach, the categories of information involved, steps taken to address the breach, and recommended steps for affected individuals."
      },
      {
        "type": "heading2",
        "text": "15. EMAIL, SMS & MOBILE COMMUNICATIONS"
      },
      {
        "type": "paragraph",
        "text": "Marketing emails: You may unsubscribe from marketing emails at any time by clicking the 'Unsubscribe' link in any marketing email or by emailing support@cocojojo.com with 'Email Unsubscribe' in the subject line. We will process unsubscribe requests within ten (10) business days. Transactional, account-related, and legally required communications may continue after unsubscribe."
      },
      {
        "type": "paragraph",
        "text": "SMS messages: By providing your mobile phone number, you consent to receive transactional, operational, customer support, and marketing communications via SMS and related messaging technologies where permitted by law. Consent to marketing SMS is not a condition of purchase. To opt out of marketing SMS messages, reply STOP to any marketing text message or contact support@cocojojo.com. Standard message and data rates may apply."
      },
      {
        "type": "paragraph",
        "text": "Do-Not-Call: We respect Do-Not-Call registry preferences for telemarketing calls. For questions about telephone communications, contact support@cocojojo.com."
      },
      {
        "type": "heading2",
        "text": "16. USER GENERATED CONTENT"
      },
      {
        "type": "paragraph",
        "text": "If you submit reviews, testimonials, comments, photos, videos, before-and-after images, social media tags, product feedback, or other content to COCO JOJO LLC through any channel, you grant COCO JOJO LLC a non-exclusive, worldwide, perpetual, irrevocable, sublicensable, transferable, royalty-free license to use, reproduce, modify, adapt, distribute, display, publish, commercialize, advertise, market, create derivative works from, and otherwise utilize such content for all commercial, operational, analytical, training, marketing, advertising, and promotional purposes without further compensation to you."
      },
      {
        "type": "paragraph",
        "text": "You represent and warrant that: you own or have all necessary rights to submitted content; the content does not infringe any third party rights; the content is accurate, truthful, and non-misleading; and the content does not contain unlawful, defamatory, or harmful material. COCO JOJO LLC reserves the right to remove, restrict, or reject any user content at its sole discretion."
      },
      {
        "type": "heading2",
        "text": "17. WHOLESALE, PRIVATE LABEL & CONTRACT MANUFACTURING DATA"
      },
      {
        "type": "paragraph",
        "text": "Wholesale customers, distributors, resellers, private label clients, and contract manufacturing clients acknowledge that business contact information, project specifications, formulation requests, purchase history, and related commercial data is collected and processed for fulfillment, manufacturing, quality control, regulatory compliance, business operations, and relationship management purposes."
      },
      {
        "type": "paragraph",
        "text": "Commercial customers are solely responsible for their own data privacy compliance obligations, including compliance with CCPA/CPRA, GDPR, and applicable laws governing the personal information of their own customers, employees, and business contacts. COCO JOJO LLC does not assume responsibility for commercial customers' privacy compliance obligations."
      },
      {
        "type": "heading2",
        "text": "18. INTERNATIONAL SALES, EXPORT & CUSTOMS DATA"
      },
      {
        "type": "paragraph",
        "text": "Customers purchasing internationally acknowledge that personal information including names, addresses, tax identification numbers, and commercial information may be shared with customs authorities, freight carriers, freight forwarders, customs brokers, import/export compliance services, and governmental agencies as required by applicable import/export laws and customs regulations. Customers are solely responsible for their own compliance with applicable import laws, customs requirements, duties, taxes, and market-specific regulatory obligations."
      },
      {
        "type": "heading2",
        "text": "19. FTC, FDA & REGULATORY CLAIMS DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "Statements made by COCO JOJO LLC have not necessarily been evaluated by the U.S. Food and Drug Administration. Products are intended for cosmetic purposes only unless explicitly stated otherwise in a signed written agreement. Information provided by COCO JOJO LLC is not intended to diagnose, treat, cure, or prevent any disease. Nothing provided by COCO JOJO LLC constitutes medical advice, pharmaceutical advice, regulatory advice, or professional certification."
      },
      {
        "type": "heading2",
        "text": "20. WIRE FRAUD, PAYMENT SECURITY & IMPERSONATION DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC is not responsible for losses arising from intercepted communications, fraudulent wire instructions, phishing attacks, unauthorized email activity, cybercrime, payment fraud, deepfake impersonation, AI-generated impersonation, spoofed domains, fake social media accounts, or related third party conduct."
      },
      {
        "type": "paragraph",
        "text": "Accordingly, COCO JOJO LLC strongly recommends that all customers independently verify payment instructions, banking information, invoice changes, and wire instructions through a previously verified telephone number or secure communication method before transmitting any funds. COCO JOJO LLC's official communications originate exclusively from @COCOJOJO.com email addresses and verified official channels."
      },
      {
        "type": "heading2",
        "text": "21. GOVERNMENT, REGULATORY & LAW ENFORCEMENT COOPERATION"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC may disclose, preserve, transfer, or produce any information, communications, records, account information, transaction records, technical logs, metadata, uploads, payment information, AI logs, session records, and analytics data to regulators, courts, law enforcement authorities, insurers, legal counsel, or governmental agencies where reasonably necessary to: comply with applicable laws or legal process; respond to subpoenas, regulatory inquiries, or governmental requests; cooperate with law enforcement or regulatory investigations; investigate misconduct, fraud, or security incidents; enforce agreements; or protect COCO JOJO LLC's rights, property, employees, customers, or operations."
      },
      {
        "type": "paragraph",
        "text": "Users acknowledge that COCO JOJO LLC may be legally required to disclose information without prior notice as permitted or required by law. Where permitted by law, we will make commercially reasonable efforts to notify you of such requests before disclosure unless prohibited by law or court order."
      },
      {
        "type": "heading2",
        "text": "22. INTELLECTUAL PROPERTY & DMCA POLICY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC respects intellectual property rights and expects users to do the same. If you believe content available through our services infringes your intellectual property rights, you may submit a notice to support@cocojojo.com containing: identification of the copyrighted work; identification of the allegedly infringing material with sufficient detail to locate it; your contact information; a good faith statement that the use is unauthorized; a statement under penalty of perjury that the information is accurate; and your physical or electronic signature as the rights holder or authorized representative."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC will review DMCA notices and take appropriate action, which may include removing, restricting, or disabling access to allegedly infringing content. COCO JOJO LLC reserves the right to terminate accounts of repeat copyright infringers."
      },
      {
        "type": "heading2",
        "text": "23. CHILDREN'S PRIVACY"
      },
      {
        "type": "paragraph",
        "text": "Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors under 18. If we discover we have inadvertently collected personal information from a minor, we will promptly delete such information. If you believe we have inadvertently collected information from a minor, contact us immediately at support@cocojojo.com."
      },
      {
        "type": "paragraph",
        "text": "For users between the ages of 16 and 18, we do not sell or share personal information without affirmative authorization. We do not have actual knowledge that we sell or share personal information of minors under 16."
      },
      {
        "type": "heading2",
        "text": "24. THIRD PARTY WEBSITES & SERVICES"
      },
      {
        "type": "paragraph",
        "text": "Our website may contain links to third party websites, social media platforms, marketplace listings, payment portals, and external services. This Privacy Policy does not apply to third party websites or services. We encourage you to review the privacy policies of any third party services you access. COCO JOJO LLC is not responsible for the privacy practices, data handling, security, or content of third party websites or services."
      },
      {
        "type": "paragraph",
        "text": "Moreover, third party advertising partners, analytics providers, payment processors, and logistics providers operate under their own privacy policies. We select service providers with commercially reasonable privacy and security standards, but we cannot guarantee the practices of third party services."
      },
      {
        "type": "heading2",
        "text": "25. FORCE MAJEURE & OPERATIONAL DISRUPTIONS"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC shall not be liable for interruptions, delays, data unavailability, failures, or losses arising from cyberattacks, internet outages, cloud infrastructure failures, AI system outages, third party failures, natural disasters, pandemics, labor shortages, government actions, acts of God, utility failures, supply chain disruptions, banking disruptions, or events beyond our reasonable control, including any impact on data processing, storage, or availability."
      },
      {
        "type": "heading2",
        "text": "26. CHANGES TO THIS PRIVACY POLICY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC reserves the right to update this Privacy Policy at any time. We will post the updated Policy on our website with a new effective date and version number. For material changes - including changes to how we collect, use, or share personal information, or changes to your rights - we will provide at least thirty (30) days advance notice to registered users via email before the changes take effect."
      },
      {
        "type": "paragraph",
        "text": "By contrast, non-material changes, clarifications, and updates that do not affect your rights or our data practices take effect upon posting. Continued use of our services after the effective date of any change constitutes acceptance of the updated Privacy Policy."
      },
      {
        "type": "paragraph",
        "text": "In addition, we maintain an archive of prior Privacy Policy versions. To request a prior version, email support@cocojojo.com."
      },
      {
        "type": "heading2",
        "text": "27. DISPUTE RESOLUTION & GOVERNING LAW"
      },
      {
        "type": "paragraph",
        "text": "Any disputes relating to this Privacy Policy, our data practices, or your privacy rights are subject to the dispute resolution provisions, mandatory informal resolution requirement, arbitration clause, jury trial waiver, class action waiver, and governing law provisions contained in the COCO JOJO LLC Terms of Service Version 5.0, incorporated herein by reference."
      },
      {
        "type": "paragraph",
        "text": "California law governs this Privacy Policy without regard to conflicts of laws provisions. Nothing in this section limits your right to file a complaint with the California Privacy Protection Agency (CPPA), the California Attorney General, or any other applicable regulatory authority."
      },
      {
        "type": "heading2",
        "text": "28. NO WARRANTY REGARDING WEBSITE & INFORMATION ACCURACY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC does not warrant that website content, specifications, pricing, technical information, product descriptions, availability, materials, AI-generated content, or related information is accurate, complete, current, uninterrupted, secure, or error-free. All information is provided for informational purposes only and is subject to change without notice."
      },
      {
        "type": "heading2",
        "text": "29. CALIFORNIA PRIVACY PROTECTION AGENCY & REGULATORY COMPLAINTS"
      },
      {
        "type": "paragraph",
        "text": "In particular, California residents with unresolved privacy complaints, concerns about our data practices, or questions about their privacy rights may contact or file a complaint with:"
      },
      {
        "type": "paragraph",
        "text": "California Privacy Protection Agency (CPPA)"
      },
      {
        "type": "paragraph",
        "text": "Website: cppa.ca.gov"
      },
      {
        "type": "paragraph",
        "text": "Email: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "California Attorney General - Privacy Enforcement"
      },
      {
        "type": "paragraph",
        "text": "Website: oag.ca.gov/privacy"
      },
      {
        "type": "paragraph",
        "text": "However, we encourage you to contact us first at support@cocojojo.com so we can address your concerns directly before involving a regulatory authority."
      },
      {
        "type": "heading2",
        "text": "30. CONTACT INFORMATION & PRIVACY OFFICER"
      },
      {
        "type": "paragraph",
        "text": "For all privacy-related inquiries, consumer rights requests, data breach notifications, opt-out requests, or questions about this Policy, contact:"
      },
      {
        "type": "paragraph",
        "text": "Privacy Officer - COCO JOJO LLC"
      },
      {
        "type": "paragraph",
        "text": "Privacy Requests: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "General: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Website: www.COCOJOJO.com"
      },
      {
        "type": "paragraph",
        "text": "Privacy Policy URL: www.COCOJOJO.com/privacy-policy"
      },
      {
        "type": "paragraph",
        "text": "We are committed to resolving privacy concerns promptly and in good faith. We will acknowledge all privacy inquiries within ten (10) business days."
      },
      {
        "type": "paragraph",
        "text": "www.COCOJOJO.com | support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC - All Rights Reserved | Privacy Policy - Version 2.0 - May 27, 2026"
      }
    ]
  },
  {
    "slug": "supplemental-privacy-policy",
    "title": "Supplemental Privacy Policy",
    "footerLabel": "Supplemental Privacy Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": null,
    "summary": "Supplemental privacy disclosures covering additional rights, incentives, international transfers, automated processing, and related privacy practices.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. Notice of Financial Incentive"
      },
      {
        "type": "paragraph",
        "text": "This section is provided pursuant to Cal. Civ. Code Section 1798.125(b) and 11 CCR Section 7016. COCO JOJO LLC may offer programs, discounts, rewards, loyalty benefits, wholesale account benefits, referral rewards, or other incentives that may be considered \"financial incentives\" under the CCPA/CPRA because they involve the collection, retention, or use of personal information."
      },
      {
        "type": "heading3",
        "text": "1.1 Programs That May Constitute Financial Incentives"
      },
      {
        "type": "listItem",
        "text": "Email or SMS sign-up discounts (e.g., a percentage off a first order in exchange for an email address)"
      },
      {
        "type": "listItem",
        "text": "Loyalty, rewards, or VIP programs"
      },
      {
        "type": "listItem",
        "text": "Referral and affiliate reward programs"
      },
      {
        "type": "listItem",
        "text": "Wholesale, trade, or professional account pricing tied to account registration"
      },
      {
        "type": "listItem",
        "text": "Promotional offers requiring submission of personal information"
      },
      {
        "type": "heading3",
        "text": "1.2 Material Terms"
      },
      {
        "type": "paragraph",
        "text": "Participation in any such program is entirely voluntary, requires your opt-in, and you may withdraw at any time by contacting us at the address in Section 7 or by following the unsubscribe or cancellation instructions provided with the program. The personal information collected typically includes identifiers (such as name, email address, phone number, and purchase history). We use this information to administer the program, communicate with you, and personalize offers."
      },
      {
        "type": "heading3",
        "text": "1.3 Good-Faith Estimate of Value"
      },
      {
        "type": "paragraph",
        "text": "The CCPA/CPRA requires a good-faith estimate of the value of the consumer data that forms the basis of any financial incentive, and a description of the method used to calculate that value. COCO JOJO LLC reasonably and in good faith estimates that the value of the personal information provided in connection with these programs is approximately equal to the value of the discount, reward, or benefit offered. We calculate this value based on the expense reasonably related to offering the incentive (including the monetary cost of discounts and rewards) measured against the value to our business of the personal information collected. We do not assign a distinct dollar value to any individual element of personal information; the estimate reflects the aggregate value of the program to the business and the consumer."
      },
      {
        "type": "paragraph",
        "text": "Any difference in price, rate, level, or quality of goods or services offered through these programs is reasonably related to the value provided to COCO JOJO LLC by the consumer's personal information. We do not use financial incentives to discriminate against consumers who exercise their privacy rights."
      },
      {
        "type": "heading2",
        "text": "2. Cosmetovigilance and Adverse Event Reporting (MoCRA)"
      },
      {
        "type": "paragraph",
        "text": "As a cosmetics manufacturer subject to the federal Modernization of Cosmetics Regulation Act of 2022 (\"MoCRA\"), COCO JOJO LLC maintains a cosmetovigilance program for the collection, evaluation, recordkeeping, and - where applicable - reporting of adverse events associated with cosmetic products."
      },
      {
        "type": "heading3",
        "text": "2.1 Information We Collect for Cosmetovigilance"
      },
      {
        "type": "paragraph",
        "text": "If you voluntarily report an adverse reaction, product complaint, sensitivity, or undesirable side effect, we may collect: your contact information; a description of the reaction or complaint; the product and batch or lot number; the date and circumstances of use; and any photographs, images, or health-related information you choose to provide. Some of this information may constitute sensitive personal information under the CCPA/CPRA."
      },
      {
        "type": "heading3",
        "text": "2.2 How We Use Cosmetovigilance Information"
      },
      {
        "type": "paragraph",
        "text": "We use this information solely to evaluate product safety, investigate complaints, maintain adverse-event records as required by MoCRA, fulfill quality-assurance and regulatory obligations, and, where legally required, report serious adverse events to the U.S. Food and Drug Administration (\"FDA\") or other applicable health authorities. Consistent with 11 CCR Section 7027, we do not use this sensitive personal information to infer characteristics about you. We retain adverse-event records for the period required by MoCRA and applicable law (generally a minimum of six years, and three years for small businesses, where applicable)."
      },
      {
        "type": "heading3",
        "text": "2.3 Disclosure for Safety and Regulatory Purposes"
      },
      {
        "type": "paragraph",
        "text": "We may disclose adverse-event information to the FDA, other health or regulatory authorities, our quality and safety personnel, contract manufacturers, suppliers, insurers, and legal advisors, in each case to the extent necessary for product safety evaluation, regulatory compliance, or legal purposes."
      },
      {
        "type": "heading2",
        "text": "3. Legal Bases for Processing, by Activity"
      },
      {
        "type": "paragraph",
        "text": "For users in jurisdictions requiring a legal basis for processing (such as the EEA, UK, and Switzerland), the following table maps our principal processing activities to their legal bases under Article 6 GDPR and analogous laws. This supplements the general legal-basis disclosure in the Privacy Policy."
      },
      {
        "type": "table",
        "rows": [
          [
            "Processing Activity",
            "Legal Basis"
          ],
          [
            "Processing and fulfilling orders, managing accounts",
            "Performance of a contract (Art. 6(1)(b))"
          ],
          [
            "Processing payments and evaluating Net-30 credit",
            "Contract performance and legitimate interests (Art. 6(1)(b), (f))"
          ],
          [
            "Tax, accounting, and regulatory recordkeeping",
            "Legal obligation (Art. 6(1)(c))"
          ],
          [
            "Cosmetovigilance and adverse-event reporting",
            "Legal obligation and vital interests (Art. 6(1)(c), (d))"
          ],
          [
            "Fraud prevention, security, and IT protection",
            "Legitimate interests (Art. 6(1)(f))"
          ],
          [
            "Marketing emails and SMS",
            "Consent, or legitimate interests where permitted (Art. 6(1)(a), (f))"
          ],
          [
            "Advertising cookies and cross-context behavioral advertising",
            "Consent (Art. 6(1)(a))"
          ],
          [
            "Product and service improvement, analytics",
            "Legitimate interests (Art. 6(1)(f))"
          ],
          [
            "Processing sensitive personal information",
            "Consent or as necessary for the requested service / legal compliance (Art. 9(2))"
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "4. Profiling, Automated Processing, and Targeted Advertising"
      },
      {
        "type": "heading3",
        "text": "4.1 What Profiling Means"
      },
      {
        "type": "paragraph",
        "text": "For transparency, \"profiling\" means any form of automated processing of personal information used to evaluate, analyze, or predict aspects concerning a person, such as their preferences, interests, behavior, location, or purchasing habits. COCO JOJO LLC may use profiling techniques to personalize content, recommend products, build audience segments, and deliver relevant marketing."
      },
      {
        "type": "heading3",
        "text": "4.2 Your Right to Opt Out of Profiling for Advertising"
      },
      {
        "type": "paragraph",
        "text": "You have the right to opt out of profiling in furtherance of decisions that produce legal or similarly significant effects, and to opt out of the use of your personal information for cross-context behavioral advertising. You may exercise these rights using the opt-out methods in Section 11.5 of the Privacy Policy, by emailing us, or by transmitting a Global Privacy Control signal."
      },
      {
        "type": "heading3",
        "text": "4.3 Targeted Advertising via Email (Separate from Cookies)"
      },
      {
        "type": "paragraph",
        "text": "Separately from cookie-based advertising, if you have provided your email address, we may use it (in hashed or other non-cookie form) to deliver targeted advertising of COCO JOJO products on third-party platforms such as social media and search engines. This email-based advertising opt-out is separate from the cookie opt-out. To opt out of email-based targeted advertising, email us at the address in Section 7 with the subject line \"Opt Out of Email-Based Advertising.\" Opting out of cookies alone does not opt you out of email-based advertising, and vice versa."
      },
      {
        "type": "heading2",
        "text": "5. Recognized Opt-Out Preference Signals"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC honors opt-out preference signals that we recognize as valid. A signal is considered valid where: (1) it is transmitted in a format commonly used and recognized by businesses, such as an HTTP header field or JavaScript object; and (2) the platform, technology, or mechanism sending the signal makes clear to the consumer that its use is intended to opt the consumer out of the sale and sharing of personal information. At present, we recognize and process the Global Privacy Control (\"GPC\") signal as a valid opt-out preference signal for California residents, consistent with Cal. Civ. Code Section 1798.135(b) and 11 CCR Section 7025."
      },
      {
        "type": "heading2",
        "text": "6. California Job Applicant and Candidate Privacy Notice"
      },
      {
        "type": "paragraph",
        "text": "This section applies to California residents who apply for employment, internships, or contractor engagements with COCO JOJO LLC (\"Candidates\"), and is provided pursuant to the CCPA/CPRA."
      },
      {
        "type": "heading3",
        "text": "6.1 Categories of Personal Information Collected from Candidates"
      },
      {
        "type": "listItem",
        "text": "Contact information (name, address, email, phone, signature)"
      },
      {
        "type": "listItem",
        "text": "Government identifiers where legally required (e.g., for I-9 / work authorization)"
      },
      {
        "type": "listItem",
        "text": "Professional and employment history, certifications, and references"
      },
      {
        "type": "listItem",
        "text": "Education information"
      },
      {
        "type": "listItem",
        "text": "Information you voluntarily provide regarding accommodation needs"
      },
      {
        "type": "listItem",
        "text": "Inferences and assessments drawn from application materials"
      },
      {
        "type": "listItem",
        "text": "Publicly available professional and social-media information"
      },
      {
        "type": "heading3",
        "text": "6.2 How We Use Candidate Information"
      },
      {
        "type": "paragraph",
        "text": "We use Candidate personal information to evaluate candidacy, administer the application and hiring process, conduct background and reference checks where permitted, comply with legal obligations (such as work-authorization verification), protect against fraud and security incidents, and establish or defend legal claims."
      },
      {
        "type": "heading3",
        "text": "6.3 Candidate Rights and No Sale or Sharing"
      },
      {
        "type": "paragraph",
        "text": "Candidates have the rights to know, access, correct, and delete personal information, and the right to non-discrimination, subject to exceptions under the CCPA/CPRA. COCO JOJO LLC does not \"sell\" or \"share\" Candidate personal information for cross-context behavioral advertising, and does not use Candidate sensitive personal information except for the purposes permitted under 11 CCR Section 7027. We retain unsuccessful applicant data for two (2) years from the application date, and records of hired individuals for the duration of engagement plus seven (7) years."
      },
      {
        "type": "heading2",
        "text": "7. Virtual Try-On, Image, and AI Skin-Analysis Technologies"
      },
      {
        "type": "paragraph",
        "text": "To the extent COCO JOJO LLC offers (now or in the future) virtual try-on, shade-matching, AI skin-analysis, or similar image-based technologies, the following applies. Photographs or images you submit for such features are used solely to provide the requested feature. Where such technology is operated by a third-party vendor, image processing may be performed by the vendor under contract, and COCO JOJO LLC may not retain the underlying images after your session ends. Where COCO JOJO LLC retains such images, they are stored only for the limited period necessary to provide the feature and are then deleted or anonymized. We do not use facial geometry or similar data to identify you, and we do not sell or share such images. If any such feature would collect biometric information as defined by applicable law, we will provide a separate notice and obtain any consent required before collection."
      },
      {
        "type": "heading2",
        "text": "8. How to Contact Us and Exercise Rights"
      },
      {
        "type": "paragraph",
        "text": "All rights described in this Supplement may be exercised using the methods in Sections 11.2 and 30 of the Privacy Policy. For consistency across all COCO JOJO LLC policies, privacy requests, opt-outs, and questions about this Supplement may be directed to:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Privacy Requests",
            "support@cocojojo.com (subject line: \"Privacy Request - [Right]\")"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Note on contact email: To maintain consistency across the COCO JOJO LLC policy suite, privacy requests and related questions are directed to support@cocojojo.com."
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved. - Supplemental Privacy Notice, May 27, 2026"
      }
    ]
  },
  {
    "slug": "terms-of-service",
    "title": "Terms of Service",
    "footerLabel": "Terms of Service",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": null,
    "summary": "The terms governing use of COCOJOJO websites, purchases, accounts, wholesale services, communications, content, and related digital services.",
    "metaTitle": "Terms of Service — Orders & Site Use",
    "metaDescription": "Read the COCOJOJO terms of service. Understand ordering, payment, shipping, returns and the rules that apply when you use our wholesale site.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "These Terms of Service (\"Terms\") constitute a legally binding agreement between you and COCO JOJO LLC (\"COCO JOJO,\" \"Company,\" \"we,\" \"our,\" or \"us\") governing access to and use of our websites, ecommerce systems, wholesale systems, customer portals, AI systems, applications, communications, technologies, digital tools, products, services, social media platforms, private label services, OEM/ODM services, contract manufacturing services, and all related business operations, including all current and future technologies, systems, features, integrations, and offerings."
      },
      {
        "type": "paragraph",
        "text": "By accessing, browsing, registering with, purchasing from, communicating with, or otherwise using any COCO JOJO LLC services, systems, websites, products, or communications, you acknowledge that you have read, understood, and irrevocably agreed to these Terms and our Privacy Policy."
      },
      {
        "type": "paragraph",
        "text": "If you do not agree to these Terms, you must immediately discontinue all use of our services, systems, and websites."
      },
      {
        "type": "heading2",
        "text": "1. COMPANY INFORMATION"
      },
      {
        "type": "heading2",
        "text": "COCO JOJO LLC"
      },
      {
        "type": "paragraph",
        "text": "Website: www.COCOJOJO.com | General: support@cocojojo.com | Privacy: support@cocojojo.com"
      },
      {
        "type": "heading2",
        "text": "2. DOCUMENT VERSION CONTROL & AMENDMENT LOG"
      },
      {
        "type": "paragraph",
        "text": "For reference, this document is COCO JOJO LLC Terms of Service Version 5.0, effective May 27, 2026. Prior versions are archived and available upon written request to support@cocojojo.com."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC reserves the right to amend these Terms at any time. For material changes, COCO JOJO LLC will provide at least thirty (30) days advance notice to registered account holders via email. Non-material changes take effect immediately upon posting. Continued use after any amendment constitutes irrevocable acceptance."
      },
      {
        "type": "paragraph",
        "text": "Version history:"
      },
      {
        "type": "listItem",
        "text": "v1.0 - Original Terms of Service"
      },
      {
        "type": "listItem",
        "text": "v2.0 - Expanded wholesale, arbitration, and digital evidence provisions"
      },
      {
        "type": "listItem",
        "text": "v3.0 - CCPA/CPRA rights, liquidated damages, reseller policy, MSA cross-reference, anti-disparagement, Net 30 incorporation"
      },
      {
        "type": "listItem",
        "text": "v4.0 - Revised anti-disparagement, ADA accessibility, regulatory claims disclaimer, AI liability expansion, export controls, no professional advice, no reliance, retail/B2B separation, evidence authenticity, force majeure expansion"
      },
      {
        "type": "listItem",
        "text": "v5.0 - FAA supremacy, delegation clause, injunctive relief carveout, PAGA waiver, Section 230 immunity, deepfake disclaimer, regulatory indemnification, supplier substitution rights, natural variability expansion, retailer/marketplace disclaimer expansion, beta systems, mass arbitration abuse clause, sanctions circumvention, biological/stem cell disclaimer, returns/refund exclusions, statute of frauds, data breach consequential damages exclusion, OEM insurance requirements, payment obligation survival, force majeure modernization (May 27, 2026)"
      },
      {
        "type": "heading2",
        "text": "3. ELIGIBILITY"
      },
      {
        "type": "paragraph",
        "text": "By using our services, you represent and warrant that you are at least eighteen (18) years old, possess full legal capacity to enter binding agreements, are authorized to act on behalf of any business entity you represent, have provided accurate and lawful information, will comply with all applicable laws and regulations, are not located in any jurisdiction subject to U.S. trade sanctions, and are not listed on any OFAC sanctions list, BIS restricted party list, or other prohibited parties list."
      },
      {
        "type": "heading2",
        "text": "4. WEBSITE ACCEPTANCE & CLICKWRAP CONSENT"
      },
      {
        "type": "paragraph",
        "text": "By creating an account, placing an order, submitting payment, checking acceptance checkboxes, clicking acceptance buttons, or otherwise interacting with our systems, you acknowledge and irrevocably agree to these Terms and the Privacy Policy."
      },
      {
        "type": "paragraph",
        "text": "Specifically, at checkout and account creation, users are presented with the following acknowledgment which must be affirmatively accepted before proceeding:"
      },
      {
        "type": "paragraph",
        "text": "\"I acknowledge that I have read and agree to the COCO JOJO LLC Terms of Service and Privacy Policy.\""
      },
      {
        "type": "paragraph",
        "text": "Electronic acceptance constitutes legally binding consent equivalent to a written signature. COCO JOJO LLC records digital evidence of acceptance including IP addresses, timestamps, device identifiers, browser information, session metadata, and system logs, which constitute admissible evidence in any arbitration or legal proceeding."
      },
      {
        "type": "heading2",
        "text": "5. ELECTRONIC COMMUNICATIONS, E-SIGN CONSENT & RECORD AUTHENTICITY"
      },
      {
        "type": "paragraph",
        "text": "You expressly consent to receive electronic communications including emails, SMS messages, invoices, notices, agreements, confirmations, automated communications, AI-assisted communications, and records. Electronic records, agreements, notices, and signatures satisfy all legal writing and signature requirements under the E-SIGN Act, UETA, and California law."
      },
      {
        "type": "paragraph",
        "text": "Users expressly agree that the following records may be authenticated through declaration, certification, affidavit, or automated system records and shall not be denied admissibility in any legal, arbitral, regulatory, or administrative proceeding solely because they are electronically generated or maintained:"
      },
      {
        "type": "listItem",
        "text": "Digital logs, server logs, access logs, audit trail records, timestamps, and IP address logs"
      },
      {
        "type": "listItem",
        "text": "Session records, session replay records, clickstream records, and behavioral analytics data"
      },
      {
        "type": "listItem",
        "text": "CRM records, customer interaction records, AI interaction records, and communication histories"
      },
      {
        "type": "listItem",
        "text": "Electronic signatures, clickwrap acceptance records, metadata, and device identifiers"
      },
      {
        "type": "listItem",
        "text": "Payment records, transaction records, financial system records, and shipping scan records"
      },
      {
        "type": "listItem",
        "text": "Account records, order histories, and all automated system-generated documents"
      },
      {
        "type": "heading2",
        "text": "6. NET 30, TRADE CREDIT & PURCHASE ORDER INCORPORATION"
      },
      {
        "type": "paragraph",
        "text": "All Net 30 credit accounts, trade credit accounts, purchase orders, invoices, credit applications, and Bank Information Forms entered into with COCO JOJO LLC are expressly subject to and incorporate these Terms in their entirety by reference. In the event of any conflict between a purchase order, Net 30 Credit Agreement, or other commercial document and these Terms, these Terms shall control unless the conflicting provision is contained in a Master Service Agreement or other written agreement signed by an authorized officer of COCO JOJO LLC."
      },
      {
        "type": "heading2",
        "text": "7. STATUTE OF FRAUDS & WRITTEN MODIFICATION ONLY"
      },
      {
        "type": "paragraph",
        "text": "No oral statement, course of dealing, course of performance, text message, social media communication, direct message, AI chatbot interaction, email (unless forming part of a signed written agreement), informal communication, trade usage, or industry custom shall modify, supplement, amend, or supersede these Terms or any provision hereof."
      },
      {
        "type": "paragraph",
        "text": "Any modification to these Terms must be expressly confirmed in a written agreement signed by an authorized officer of COCO JOJO LLC. No employee, agent, representative, or contractor of COCO JOJO LLC has authority to modify these Terms orally or through informal communications."
      },
      {
        "type": "paragraph",
        "text": "Users expressly waive any claim based upon alleged oral modifications, informal understandings, text message agreements, email-based modifications not incorporated into a signed written agreement, or modifications based on prior dealings or trade custom."
      },
      {
        "type": "heading2",
        "text": "8. RETAIL CONSUMER VS. COMMERCIAL PURCHASER SEPARATION"
      },
      {
        "type": "paragraph",
        "text": "In particular, certain provisions of these Terms apply specifically to commercial purchasers, wholesale customers, distributors, resellers, OEM/ODM clients, private label clients, and contract manufacturing customers engaged in business-to-business commercial transactions."
      },
      {
        "type": "paragraph",
        "text": "Retail consumers purchasing products for personal, family, or household use may possess non-waivable rights under applicable consumer protection laws - including the CLRA, UCL, and Song-Beverly Consumer Warranty Act - that supersede conflicting provisions solely to the minimum extent required by applicable law. Nothing in these Terms waives non-waivable California consumer rights."
      },
      {
        "type": "paragraph",
        "text": "Commercial purchasers are not consumers under applicable consumer protection statutes. All liability limitations, arbitration provisions, warranty disclaimers, and damage waivers apply in full force to all commercial transactions."
      },
      {
        "type": "heading2",
        "text": "9. BINDING B2B COMMERCIAL ACKNOWLEDGMENT"
      },
      {
        "type": "paragraph",
        "text": "Commercial purchasers, wholesale customers, resellers, distributors, private label clients, OEM/ODM clients, and contract manufacturing customers expressly acknowledge and agree that they are sophisticated commercial business entities engaging in arm's length commercial transactions, not consumers purchasing for personal use, that they have conducted independent legal, regulatory, and business due diligence, that they had reasonable opportunity to consult independent legal counsel prior to acceptance, and that they voluntarily accept all commercial risks inherent in their operations."
      },
      {
        "type": "paragraph",
        "text": "Commercial purchasers expressly waive any claim that these Terms constitute a contract of adhesion, unconscionable terms, a product of unequal bargaining power, or consumer-facing retail terms. This acknowledgment strengthens enforceability of all liability limitations, arbitration provisions, class action waivers, jury trial waivers, and warranty disclaimers herein."
      },
      {
        "type": "heading2",
        "text": "10. NO PROFESSIONAL ADVICE"
      },
      {
        "type": "paragraph",
        "text": "Nothing provided by COCO JOJO LLC through any channel - including websites, AI systems, customer service, educational materials, technical documents, blogs, videos, formulation guidance, COAs, SDS, TDS, consultations, recommendations, samples, or any other communication - constitutes legal advice, medical advice, regulatory advice, tax advice, investment advice, dermatological advice, pharmaceutical advice, or any form of professional certification."
      },
      {
        "type": "paragraph",
        "text": "Therefore, users must independently consult qualified, licensed professionals in the relevant field before relying upon any information, making any regulatory submission, commercializing any product, making any medical decision, or taking any action based on information received from COCO JOJO LLC."
      },
      {
        "type": "heading2",
        "text": "11. NO RELIANCE"
      },
      {
        "type": "paragraph",
        "text": "Users acknowledge they are not relying upon any of the following in entering into any transaction or agreement with COCO JOJO LLC:"
      },
      {
        "type": "listItem",
        "text": "Verbal statements, oral representations, or informal communications"
      },
      {
        "type": "listItem",
        "text": "Projected lead times, production estimates, or delivery time estimates"
      },
      {
        "type": "listItem",
        "text": "Marketing language, advertising materials, or promotional content"
      },
      {
        "type": "listItem",
        "text": "AI-generated outputs, automated recommendations, or chatbot communications"
      },
      {
        "type": "listItem",
        "text": "Samples, prototypes, or pre-production test batches"
      },
      {
        "type": "listItem",
        "text": "Prior dealings, course of conduct, or prior transactions"
      },
      {
        "type": "listItem",
        "text": "Trade usage, industry custom, or industry standard practices"
      },
      {
        "type": "listItem",
        "text": "Third party representations, influencer statements, or affiliate communications"
      },
      {
        "type": "listItem",
        "text": "Educational materials, blogs, webinars, or technical presentations"
      },
      {
        "type": "listItem",
        "text": "Informal email communications not forming part of a signed written agreement"
      },
      {
        "type": "paragraph",
        "text": "Only representations expressly contained in a separately executed written agreement signed by an authorized officer of COCO JOJO LLC shall be binding upon COCO JOJO LLC."
      },
      {
        "type": "heading2",
        "text": "12. PRODUCTS, SERVICES & INFORMATION"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC provides cosmetic products, skincare products, haircare products, raw materials, wholesale products, formulations, consultations, contract manufacturing, OEM/ODM services, private label services, ecommerce systems, digital tools, AI systems, educational materials, and related services. All descriptions, pricing, specifications, formulations, ingredient lists, technical data, lead times, and marketing materials are subject to change without notice and do not constitute binding representations unless confirmed in a signed written agreement."
      },
      {
        "type": "paragraph",
        "text": "Accordingly, COCO JOJO LLC does not guarantee product availability, inventory accuracy, packaging compatibility, commercial success, product suitability, regulatory approval, retail or marketplace acceptance, continuous website functionality, or error-free operation of any system."
      },
      {
        "type": "heading2",
        "text": "13. WHOLESALE, PRIVATE LABEL & CONTRACT MANUFACTURING TERMS"
      },
      {
        "type": "paragraph",
        "text": "Wholesale customers, distributors, resellers, private label clients, OEM/ODM clients, and contract manufacturing customers are solely and exclusively responsible for all final product testing (stability, PET, compatibility, safety), all regulatory compliance (FDA, FTC, international), all product registrations and market approvals, all labeling compliance and claims substantiation, all import/export compliance, all marketplace compliance, all adverse event monitoring and recall obligations, and all consumer safety obligations."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC does not guarantee regulatory approvals, retailer approvals, marketplace approvals, customs approvals, or commercial performance unless explicitly agreed in a signed written agreement. All lead times and production estimates are approximate only and are not guaranteed."
      },
      {
        "type": "heading2",
        "text": "14. SUPPLIER SUBSTITUTION RIGHTS"
      },
      {
        "type": "paragraph",
        "text": "Additionally, COCO JOJO LLC reserves the right to substitute raw materials, ingredients, packaging components, manufacturing facilities, suppliers, carriers, logistics providers, testing laboratories, or operational methods with commercially reasonable equivalents at any time where necessary or advisable due to:"
      },
      {
        "type": "listItem",
        "text": "Raw material shortages, supplier discontinuations, or supply chain disruptions"
      },
      {
        "type": "listItem",
        "text": "Regulatory changes, ingredient restrictions, or compliance requirements"
      },
      {
        "type": "listItem",
        "text": "Force majeure events, natural disasters, or geopolitical disruptions"
      },
      {
        "type": "listItem",
        "text": "Quality concerns, safety considerations, or performance improvements"
      },
      {
        "type": "listItem",
        "text": "Supplier insolvency, business closure, or relationship termination"
      },
      {
        "type": "listItem",
        "text": "Cost optimization, operational efficiency, or sourcing improvements"
      },
      {
        "type": "paragraph",
        "text": "Substitutions shall maintain commercially reasonable equivalency to original specifications. COCO JOJO LLC shall notify customers of material substitutions affecting product specifications as soon as reasonably practicable. Customer acceptance of substituted products constitutes acceptance of the substitution for all purposes."
      },
      {
        "type": "heading2",
        "text": "15. REGULATORY CLAIMS & MARKETING COMPLIANCE"
      },
      {
        "type": "paragraph",
        "text": "Customers, resellers, distributors, private label clients, OEM/ODM clients, affiliates, influencers, and commercial users are solely and exclusively responsible for all product claims, advertising claims, social media claims, structure/function claims, ingredient claims, claims substantiation, FTC compliance, FDA compliance, all labeling compliance, and all retailer and marketplace compliance requirements."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC does not guarantee that any marketing claim, product representation, ingredient statement, testimonial, AI-generated content, influencer statement, or customer marketing material complies with applicable law unless expressly confirmed in a separately signed written agreement. Users acknowledge they are not relying on any verbal statements, marketing materials, blogs, AI outputs, or informal communications as legal or regulatory advice."
      },
      {
        "type": "heading2",
        "text": "16. RETAILER & MARKETPLACE ACCEPTANCE DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "Consequently, COCO JOJO LLC does not guarantee acceptance, continued listing, ranking, visibility, suppression avoidance, advertising eligibility, Buy Box eligibility, or compliance status on any retail or marketplace platform including but not limited to:"
      },
      {
        "type": "listItem",
        "text": "marketplace service providers, marketplace service providers FBA, marketplace service providers Vendor Central, or marketplace service providers Brand Registry"
      },
      {
        "type": "listItem",
        "text": "Walmart Marketplace, Walmart.com, or Walmart Supplier Portal"
      },
      {
        "type": "listItem",
        "text": "social media platforms Shop, social media platforms Ads, or social media platforms Affiliate programs"
      },
      {
        "type": "listItem",
        "text": "Costco, Target, Sephora, Ulta, Whole Foods, or any brick-and-mortar retailer"
      },
      {
        "type": "listItem",
        "text": "Etsy, eBay, ecommerce service providers, Faire, or any other online marketplace"
      },
      {
        "type": "listItem",
        "text": "third-party advertising providers, third-party technology providers, social media platforms, Snapchat, or any advertising platform"
      },
      {
        "type": "listItem",
        "text": "Any distributor, buying group, retail chain, or sales channel"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC shall not be liable for ASIN suppression, listing removals, account suspensions, algorithm changes, ranking losses, advertising restrictions, account deactivations, retailer delistings, or any platform enforcement actions regardless of cause."
      },
      {
        "type": "heading2",
        "text": "17. RESELLER, AUTHORIZED DEALER & MAP POLICY"
      },
      {
        "type": "paragraph",
        "text": "Commercial resellers wishing to sell COCO JOJO LLC branded products must register with COCO JOJO LLC and receive written authorization. Unauthorized resale of COCO JOJO LLC branded products on any channel is prohibited and may constitute trademark infringement. Authorized resellers agree to comply with COCO JOJO LLC MAP policy and all brand standards including accurate product descriptions, approved images, correct ingredient lists, required regulatory disclosures, and prohibition on false or misleading claims."
      },
      {
        "type": "heading2",
        "text": "18. ANTI-DISPARAGEMENT & NON-SOLICITATION"
      },
      {
        "type": "paragraph",
        "text": "Anti-Disparagement"
      },
      {
        "type": "paragraph",
        "text": "Users, customers, vendors, contractors, resellers, distributors, affiliates, and former business partners agree not to knowingly publish or communicate any false statement of material fact regarding COCO JOJO LLC, its products, personnel, business practices, formulations, or operations made with actual malice, reckless disregard for the truth, or intent to cause commercial harm."
      },
      {
        "type": "paragraph",
        "text": "However, nothing in this provision prohibits truthful factual statements, good faith reviews based on genuine experience, lawful whistleblower activity, communications with government agencies or regulators, legally protected activity under federal or California law, or testimony or statements made during legal proceedings."
      },
      {
        "type": "paragraph",
        "text": "The parties acknowledge that false commercial statements may cause substantial reputational and economic harm that is difficult to quantify and may entitle COCO JOJO LLC to injunctive relief, liquidated damages where enforceable, and all other available remedies under applicable law."
      },
      {
        "type": "paragraph",
        "text": "Non-Solicitation"
      },
      {
        "type": "paragraph",
        "text": "For a period of twelve (12) months following termination of any business relationship with COCO JOJO LLC, users agree not to directly or indirectly solicit, recruit, hire, or engage any current employee, contractor, consultant, or agent of COCO JOJO LLC with whom such party had material contact during the business relationship. Violation entitles COCO JOJO LLC to liquidated damages of $10,000 per solicited individual plus all other available remedies."
      },
      {
        "type": "heading2",
        "text": "19. LIQUIDATED DAMAGES FOR INTELLECTUAL PROPERTY VIOLATIONS"
      },
      {
        "type": "paragraph",
        "text": "The parties expressly acknowledge and agree that actual damages arising from unauthorized disclosure, misuse, or infringement may be difficult or impracticable to calculate with precision, that the following amounts represent commercially reasonable, negotiated, good faith pre-estimates of anticipated damages based on the nature of the protected interests, and that the parties intend these amounts as lawful liquidated damages and not as penalties."
      },
      {
        "type": "listItem",
        "text": "Unauthorized use or reproduction of any COCO JOJO LLC trademark, trade name, or logo: $25,000 per occurrence"
      },
      {
        "type": "listItem",
        "text": "Unauthorized disclosure, use, or misappropriation of any COCO JOJO LLC proprietary formulation or trade secret: $50,000 per formulation per occurrence"
      },
      {
        "type": "listItem",
        "text": "Unauthorized reproduction or distribution of any COCO JOJO LLC technical document, COA, SDS, TDS, or specification sheet: $10,000 per document per occurrence"
      },
      {
        "type": "listItem",
        "text": "Unauthorized reverse engineering of any COCO JOJO LLC product or formulation: $75,000 per product"
      },
      {
        "type": "listItem",
        "text": "Breach of non-solicitation: $10,000 per solicited individual"
      },
      {
        "type": "listItem",
        "text": "Breach of anti-disparagement causing documented reputational harm: $25,000 minimum per incident"
      },
      {
        "type": "paragraph",
        "text": "These amounts are in addition to COCO JOJO LLC's right to seek injunctive relief, equitable relief, attorney fees, costs, and all other available remedies. COCO JOJO LLC may elect actual damages in lieu of liquidated damages where actual damages are higher."
      },
      {
        "type": "heading2",
        "text": "20. FORMULATIONS & INTELLECTUAL PROPERTY RIGHTS"
      },
      {
        "type": "paragraph",
        "text": "Unless otherwise expressly agreed in a separately executed written agreement, COCO JOJO LLC retains full and exclusive ownership of all pre-existing formulations, technologies, manufacturing systems, processes, methods, know-how, trade secrets, and intellectual property. Custom development work may utilize proprietary COCO JOJO LLC systems, ingredients, or technologies. Customers are solely responsible for all independent intellectual property clearances before commercializing any product."
      },
      {
        "type": "heading2",
        "text": "21. MASTER SERVICE AGREEMENT RELATIONSHIP"
      },
      {
        "type": "paragraph",
        "text": "For OEM, ODM, private label, and contract manufacturing relationships, COCO JOJO LLC may require execution of a separate Master Service Agreement (MSA). The MSA shall be incorporated by reference into these Terms. In the event of any conflict between the MSA and these Terms, the MSA shall control for the specific project or relationship it governs. All manufacturing engagements without an executed MSA remain fully subject to these Terms."
      },
      {
        "type": "heading2",
        "text": "22. DEPOSITS, PAYMENTS & INVOICES"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC may require deposits, prepayment, wire transfers, ACH payments, credit approvals, milestone payments, and minimum order quantities. Unless otherwise expressly agreed in writing, the following are non-refundable under all circumstances: all deposits and down payments, all development and R&D fees, all testing and laboratory fees, all custom and private label projects once production has commenced, all contract manufacturing projects once raw material procurement has commenced, all tooling and setup fees, and all shipping charges."
      },
      {
        "type": "paragraph",
        "text": "Failure to make timely payment may result in suspension of all services, production delays, order cancellation, forfeiture of deposits, collections activity, interest charges at the maximum rate permitted by law, legal action, and permanent refusal of future business. Customers are responsible for all taxes, duties, banking fees, wire transfer fees, and transactional assessments."
      },
      {
        "type": "heading2",
        "text": "23. PAYMENT OBLIGATION SURVIVAL"
      },
      {
        "type": "paragraph",
        "text": "All payment obligations owed to COCO JOJO LLC survive and remain fully enforceable regardless of any of the following:"
      },
      {
        "type": "listItem",
        "text": "Disputes, complaints, or claims by the customer"
      },
      {
        "type": "listItem",
        "text": "Chargeback filings or payment reversals"
      },
      {
        "type": "listItem",
        "text": "Regulatory investigations or governmental inquiries"
      },
      {
        "type": "listItem",
        "text": "Arbitration filings or litigation proceedings"
      },
      {
        "type": "listItem",
        "text": "Account suspension or service termination"
      },
      {
        "type": "listItem",
        "text": "Force majeure events or operational disruptions"
      },
      {
        "type": "listItem",
        "text": "Product complaints or alleged nonconformities"
      },
      {
        "type": "paragraph",
        "text": "No dispute, complaint, claim, investigation, or legal proceeding shall excuse, suspend, defer, or reduce any payment obligation unless COCO JOJO LLC has expressly agreed in a signed written instrument. COCO JOJO LLC may pursue collection of all outstanding amounts through all available legal remedies simultaneously with or independently of any dispute resolution process."
      },
      {
        "type": "heading2",
        "text": "24. RETURNS, REFUNDS & EXCLUSION POLICY"
      },
      {
        "type": "paragraph",
        "text": "The following categories of products and transactions are non-refundable and non-returnable under all circumstances unless otherwise expressly agreed in a signed written agreement:"
      },
      {
        "type": "listItem",
        "text": "All opened products, partially used products, and products removed from original packaging"
      },
      {
        "type": "listItem",
        "text": "All custom formulation products, custom blend products, and made-to-order products"
      },
      {
        "type": "listItem",
        "text": "All private label products, white label products, and contract manufactured products"
      },
      {
        "type": "listItem",
        "text": "All products with customer-applied labeling, customer-applied modifications, or customer repackaging"
      },
      {
        "type": "listItem",
        "text": "All international shipments once shipped, including refused customs clearance and customs-held shipments"
      },
      {
        "type": "listItem",
        "text": "All products refused at delivery or returned to origin by carrier without authorization"
      },
      {
        "type": "listItem",
        "text": "All deposits, development fees, testing fees, tooling fees, and R&D costs"
      },
      {
        "type": "listItem",
        "text": "All shipping charges, freight costs, and insurance costs"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC may charge storage fees for products held beyond agreed pickup or shipment dates. Products abandoned at COCO JOJO LLC facilities for more than thirty (30) days without prior written arrangement may be disposed of or liquidated at COCO JOJO LLC's sole discretion without further liability. Customer shall remain liable for all storage fees, disposal costs, and associated expenses."
      },
      {
        "type": "heading2",
        "text": "25. CHARGEBACKS, PAYMENT DISPUTES & FRAUD PREVENTION"
      },
      {
        "type": "paragraph",
        "text": "Users agree not to initiate fraudulent, abusive, or bad faith chargebacks or payment disputes. COCO JOJO LLC maintains comprehensive digital evidence systems and may provide invoices, communications, IP logs, shipping records, digital signatures, CRM records, transaction metadata, AI system logs, fraud prevention data, and session replay records to payment processors, banks, courts, arbitrators, or law enforcement to contest improper disputes. Improper chargebacks may result in account suspension, recovery of all fees, reporting to fraud prevention networks, and legal action."
      },
      {
        "type": "heading2",
        "text": "26. SHIPPING, FREIGHT, DELIVERY & INSPECTION"
      },
      {
        "type": "paragraph",
        "text": "All shipping dates and delivery estimates are approximate only and are not guaranteed. Risk of loss transfers upon shipment to the initial carrier unless otherwise agreed. COCO JOJO LLC shall not be liable for delays caused by carriers, customs, weather, port congestion, container shortages, freight embargoes, government actions, labor shortages, supply chain disruptions, tariffs, geopolitical instability, or third party failures. Customers must inspect all shipments within seven (7) calendar days of receipt. Failure to report shortages or damages within seven (7) days constitutes full acceptance and irrevocable waiver of all related claims."
      },
      {
        "type": "heading2",
        "text": "27. NATURAL MATERIALS, AGRICULTURAL VARIABILITY & BATCH CHARACTERISTICS"
      },
      {
        "type": "paragraph",
        "text": "Natural, organic, botanical, and plant-based ingredients may inherently vary due to harvest conditions, climate, geography, seasonal variation, biological variation, and processing variation. Users acknowledge and accept that the following characteristics may vary between batches, production runs, and seasons, and shall not automatically constitute defects, nonconformities, or grounds for refusal, return, or refund:"
      },
      {
        "type": "listItem",
        "text": "Color, hue, and color intensity - including natural darkening, lightening, or seasonal color shifts"
      },
      {
        "type": "listItem",
        "text": "Odor and aroma - including natural scent variation, intensity differences, and seasonal fragrance changes"
      },
      {
        "type": "listItem",
        "text": "Texture and consistency - including natural thickening, thinning, or viscosity changes"
      },
      {
        "type": "listItem",
        "text": "Viscosity and pourability - including batch-to-batch flow differences within specification"
      },
      {
        "type": "listItem",
        "text": "Natural separation, layering, or settling - including oil separation and botanical sediment"
      },
      {
        "type": "listItem",
        "text": "Botanical sediment, plant matter, or natural particulates - which may be filtered by customer as needed"
      },
      {
        "type": "listItem",
        "text": "Color fading, oxidation, or natural aging - particularly in unpreserved or minimally preserved products"
      },
      {
        "type": "listItem",
        "text": "Cloudiness, turbidity, or natural haze - particularly in unfiltered or cold-pressed products"
      },
      {
        "type": "listItem",
        "text": "Solidification at lower temperatures - normal for many carrier oils, butters, and waxes"
      },
      {
        "type": "paragraph",
        "text": "Products meeting the stated specification range shall be deemed conforming regardless of natural variation within that range. COCO JOJO LLC may provide specification ranges rather than fixed values for naturally derived products."
      },
      {
        "type": "heading2",
        "text": "28. PRODUCT USE, MISUSE & ASSUMPTION OF RISK"
      },
      {
        "type": "paragraph",
        "text": "Products are intended solely for lawful cosmetic, commercial, industrial, manufacturing, formulation, or research use. Users voluntarily assume all risks arising from use, storage, handling, reformulation, repackaging, transportation, marketing, importation, exportation, and application of products. COCO JOJO LLC shall not be liable for misuse, excessive use, improper formulation, incompatible combinations, unauthorized modifications, contamination due to customer handling failures, or storage failures. Patch testing is strongly recommended. Products are not intended to diagnose, treat, cure, or prevent any disease unless expressly stated otherwise in a signed written agreement."
      },
      {
        "type": "heading2",
        "text": "29. BIOLOGICAL, STEM CELL, EXOSOME & EMERGING TECHNOLOGY DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "Unless expressly stated in a separately executed written agreement, COCO JOJO LLC does not warrant the legality, regulatory status, importability, medical classification, jurisdictional permissibility, FDA classification, or market authorization of:"
      },
      {
        "type": "listItem",
        "text": "Stem cell-related ingredients, stem cell-derived materials, or stem cell extracts"
      },
      {
        "type": "listItem",
        "text": "Exosome-related ingredients, exosome-derived materials, or exosome preparations"
      },
      {
        "type": "listItem",
        "text": "Biologically derived materials, human-derived materials, or animal-derived biologics"
      },
      {
        "type": "listItem",
        "text": "Peptides, bioactive peptides, or synthetic peptide analogs with drug-like activity"
      },
      {
        "type": "listItem",
        "text": "Cannabinoids, hemp-derived ingredients, CBD, CBG, or related materials"
      },
      {
        "type": "listItem",
        "text": "Emerging cosmetic technologies not yet classified under applicable FDA or international guidelines"
      },
      {
        "type": "paragraph",
        "text": "Customers purchasing, incorporating, or commercializing any of the above materials are solely responsible for obtaining independent legal, regulatory, and scientific assessment of applicable laws in all markets where such materials will be sold, distributed, or used. COCO JOJO LLC shall not be liable for any regulatory enforcement action, import refusal, marketplace suspension, or commercial loss arising from the customer's use of such materials."
      },
      {
        "type": "heading2",
        "text": "30. WOMEN'S HEALTH, REPRODUCTIVE HEALTH & MEDICAL DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC products are cosmetic and commercial products unless expressly stated otherwise in writing. COCO JOJO LLC makes no representation regarding fertility, pregnancy outcomes, hormonal effects, reproductive health, breastfeeding safety, menstrual health, or pharmaceutical effects. COCO JOJO LLC does not provide medical, pharmaceutical, dermatological, or healthcare advice. Users are solely responsible for obtaining qualified professional medical advice regarding product suitability for their specific health circumstances."
      },
      {
        "type": "heading2",
        "text": "31. ACCOUNTS & SECURITY"
      },
      {
        "type": "paragraph",
        "text": "Users are solely responsible for maintaining account credential confidentiality and all activity conducted through their accounts. COCO JOJO LLC may suspend, restrict, terminate, or refuse service to any account at any time, for any reason, without prior notice or liability, including but not limited to suspected fraud, abuse, policy violations, or business reasons."
      },
      {
        "type": "heading2",
        "text": "32. CYBERSECURITY, HACKING, IMPERSONATION & FRAUD DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC implements reasonable cybersecurity measures but cannot guarantee absolute security. COCO JOJO LLC shall not be liable for losses from cyberattacks, hacking, malware, ransomware, wire fraud, phishing, email spoofing, social engineering, fake invoices, identity theft, unauthorized access, or third party breaches."
      },
      {
        "type": "paragraph",
        "text": "Accordingly, COCO JOJO LLC strongly recommends that all users independently verify payment instructions, banking information, invoice changes, wire instructions, and account details through a previously verified telephone number or secure communication method before transmitting funds. Users are solely responsible for verifying the authenticity of all communications and payment instructions before acting."
      },
      {
        "type": "heading2",
        "text": "33. DEEPFAKE, AI IMPERSONATION & SYNTHETIC MEDIA DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC shall not be liable for unauthorized AI-generated impersonations, voice cloning, deepfake audio or video content, synthetic media, manipulated media, fake websites, spoofed domains, fraudulent social media accounts, or AI-generated representations falsely purporting to originate from COCO JOJO LLC, its employees, officers, agents, brands, or products."
      },
      {
        "type": "paragraph",
        "text": "Users shall independently verify the authenticity of any communications, media, website, social media account, or content purporting to originate from COCO JOJO LLC before taking any action, transmitting any payment, or sharing any confidential information. COCO JOJO LLC's official communications originate exclusively from @COCOJOJO.com email addresses and verified official social media accounts."
      },
      {
        "type": "paragraph",
        "text": "Furthermore, COCO JOJO LLC reserves all legal remedies against any party who creates, distributes, or uses unauthorized AI-generated impersonations or synthetic media falsely associated with COCO JOJO LLC."
      },
      {
        "type": "heading2",
        "text": "34. PRIVACY, DATA COLLECTION, TRACKING & AI SYSTEMS"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC may collect, process, analyze, store, transfer, and use personal information in accordance with the COCO JOJO LLC Privacy Policy at www.COCOJOJO.com/privacy-policy. COCO JOJO LLC may utilize cookies, pixels, AI systems, session replay technologies, behavioral analytics, fraud prevention systems, CRM systems, and marketing automation, including systems operated by third-party technology providers, third-party advertising providers, social media platforms, technology service providers, marketplace service providers, email and SMS service providers, and others. Users consent to data collection, processing, storage, and use as described in the Privacy Policy."
      },
      {
        "type": "heading2",
        "text": "35. AI SYSTEMS, AUTOMATION & GENERATED CONTENT DISCLAIMER"
      },
      {
        "type": "paragraph",
        "text": "Notably, COCO JOJO LLC may use AI systems, automated technologies, machine learning systems, recommendation systems, analytics systems, fraud prevention systems, and customer support systems."
      },
      {
        "type": "paragraph",
        "text": "Users acknowledge that AI systems may generate incomplete, inaccurate, simulated, misleading, outdated, biased, or hallucinated outputs and that all AI-generated information must be independently verified prior to reliance, manufacturing, regulatory submission, commercialization, medical use, or redistribution."
      },
      {
        "type": "paragraph",
        "text": "Certain website functions, AI systems, applications, integrations, automations, portals, and digital tools may operate in beta, testing, experimental, or developmental phases and may contain interruptions, inaccuracies, incompatibilities, or errors. COCO JOJO LLC shall not be liable for damages arising from the use of or reliance upon beta or experimental systems."
      },
      {
        "type": "heading2",
        "text": "36. SMS, TELEPHONE & COMMUNICATION CONSENT"
      },
      {
        "type": "paragraph",
        "text": "By providing contact information, users expressly consent to receive emails, SMS messages, automated and pre-recorded calls, AI-assisted communications, and marketing communications. Message and data rates may apply. Consent to marketing communications is not required as a condition of purchase. Users may opt out of non-essential marketing using available unsubscribe methods; transactional and legally required communications may continue."
      },
      {
        "type": "heading2",
        "text": "37. SECTION 230 & THIRD PARTY CONTENT IMMUNITY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC is not the publisher or speaker of third party content, user-generated content, customer reviews, influencer statements, affiliate content, reseller product listings, marketplace content, forum discussions, social media comments, or any other third party communications."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC shall not be liable for third party content and shall be entitled to all protections available under 47 U.S.C. Section 230 (Communications Decency Act), the Digital Millennium Copyright Act, and all other applicable laws providing immunity or protection for platform providers, publishers, and distributors of third party content."
      },
      {
        "type": "paragraph",
        "text": "In addition, COCO JOJO LLC reserves the right, but does not assume any obligation, to monitor, review, remove, restrict, or take action with respect to third party content on any platform or system it operates."
      },
      {
        "type": "heading2",
        "text": "38. WEBSITE ACCESSIBILITY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC strives to maintain commercially reasonable website accessibility consistent with applicable laws and industry standards. However, COCO JOJO LLC does not warrant uninterrupted accessibility, compatibility with all assistive technologies, or error-free operation of all digital systems, websites, applications, or third party integrations. Some website functions, embedded systems, payment processors, plugins, APIs, AI systems, or third party technologies may be operated by independent third parties outside COCO JOJO LLC's control. Users experiencing accessibility issues may contact support@cocojojo.com to request reasonable assistance or accommodations."
      },
      {
        "type": "heading2",
        "text": "39. INTELLECTUAL PROPERTY & DMCA"
      },
      {
        "type": "paragraph",
        "text": "All trademarks, logos, formulations, systems, software, graphics, marketing materials, and content are owned by or licensed to COCO JOJO LLC and protected by U.S. and international intellectual property laws. Users may not copy, reproduce, reverse engineer, scrape, or commercially exploit any COCO JOJO LLC materials without prior written authorization. For DMCA notices, contact support@cocojojo.com with the information required under 17 U.S.C. Section 512(c)(3)."
      },
      {
        "type": "heading2",
        "text": "40. USER GENERATED CONTENT"
      },
      {
        "type": "paragraph",
        "text": "By submitting reviews, images, videos, testimonials, or other content, users grant COCO JOJO LLC a perpetual, irrevocable, worldwide, transferable, sublicensable, royalty-free license to use, reproduce, modify, display, distribute, commercialize, and create derivative works from such content. Users warrant submitted content is accurate, lawful, and non-infringing. COCO JOJO LLC may remove or restrict any user content at its sole discretion."
      },
      {
        "type": "heading2",
        "text": "41. POLITICAL NEUTRALITY & NO FIDUCIARY RELATIONSHIP"
      },
      {
        "type": "paragraph",
        "text": "Similarly, COCO JOJO LLC does not endorse the political, social, religious, or ideological views of any customer, influencer, affiliate, or third party. Nothing in these Terms creates any fiduciary duty, advisory relationship, professional relationship, employment relationship, partnership, joint venture, or agency relationship between users and COCO JOJO LLC."
      },
      {
        "type": "heading2",
        "text": "42. REGULATORY CHANGE & EXPORT CONTROLS"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC shall not be liable for losses arising from regulatory changes, government actions, tariff increases, sanctions, or geopolitical instability. Users represent and warrant they are not located in embargoed jurisdictions, listed on OFAC sanctions or BIS restricted party lists, or acting on behalf of sanctioned parties. Users agree to comply with all applicable OFAC regulations, EAR regulations, BIS restrictions, ITAR (where applicable), international sanctions laws, and anti-corruption laws including the FCPA."
      },
      {
        "type": "paragraph",
        "text": "Users may not use COCO JOJO LLC products directly or indirectly in violation of sanctions laws, anti-boycott laws, anti-diversion laws, military end-use restrictions, or restricted country export laws. COCO JOJO LLC reserves the right to refuse, cancel, or terminate any transaction that may violate applicable trade laws."
      },
      {
        "type": "heading2",
        "text": "43. REGULATORY INVESTIGATION & GOVERNMENTAL ACTION INDEMNIFICATION"
      },
      {
        "type": "paragraph",
        "text": "Commercial customers agree to fully indemnify, defend, and hold harmless COCO JOJO LLC from any and all governmental inquiries, regulatory actions, agency investigations, enforcement proceedings, and associated costs arising from:"
      },
      {
        "type": "listItem",
        "text": "Customer labeling, marketing claims, advertising, or product representations"
      },
      {
        "type": "listItem",
        "text": "Customer resale, distribution, export, import, or commercialization activities"
      },
      {
        "type": "listItem",
        "text": "Customer reformulation, repackaging, relabeling, or product modifications"
      },
      {
        "type": "listItem",
        "text": "FDA inquiries, FDA warning letters, or FDA enforcement actions"
      },
      {
        "type": "listItem",
        "text": "FTC investigations, FTC civil investigative demands, or FTC enforcement actions"
      },
      {
        "type": "listItem",
        "text": "California Proposition 65 claims, private attorney general actions, or consumer agency complaints"
      },
      {
        "type": "listItem",
        "text": "Retailer investigations, retailer compliance audits, or retailer enforcement actions"
      },
      {
        "type": "listItem",
        "text": "Marketplace investigations, platform audits, or marketplace enforcement actions"
      },
      {
        "type": "listItem",
        "text": "Customs holds, import detentions, import refusals, or export enforcement actions"
      },
      {
        "type": "listItem",
        "text": "Consumer protection agency actions, state attorney general investigations, or class action proceedings"
      },
      {
        "type": "paragraph",
        "text": "This indemnification obligation includes all attorney fees, regulatory response costs, consultant fees, remediation costs, fines, penalties, and all other costs arising from or related to customer commercial activities."
      },
      {
        "type": "heading2",
        "text": "44. CCPA / CPRA CALIFORNIA CONSUMER PRIVACY RIGHTS"
      },
      {
        "type": "paragraph",
        "text": "This section applies to California residents pursuant to the CCPA and CPRA. California residents have the right to: Know, Delete, Correct, Opt-Out of sale or sharing for behavioral advertising, Limit use of sensitive personal information, and Non-Discrimination for exercising these rights. To submit a request: email support@cocojojo.com (subject: 'California Privacy Request'). We respond within forty-five (45) days with one permitted extension. Full CCPA/CPRA disclosures are in the Privacy Policy at www.COCOJOJO.com/privacy-policy."
      },
      {
        "type": "heading2",
        "text": "45. CALIFORNIA CONSUMER RIGHTS SAVINGS CLAUSE & PROPOSITION 65"
      },
      {
        "type": "paragraph",
        "text": "Nothing in these Terms waives any non-waivable rights afforded to California consumers under the CLRA, UCL, Song-Beverly Consumer Warranty Act, or CCPA/CPRA. Commercial business customers acknowledge they are not consumers under applicable consumer protection statutes."
      },
      {
        "type": "paragraph",
        "text": "Additionally, certain products may contain naturally occurring substances listed under California Proposition 65. Commercial customers purchasing for California resale are solely responsible for determining Proposition 65 warning requirements, conducting independent testing, providing required warnings to California consumers, and maintaining all compliance documentation."
      },
      {
        "type": "heading2",
        "text": "46. DISCLAIMER OF WARRANTIES"
      },
      {
        "type": "paragraph",
        "text": "TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, ALL PRODUCTS, SERVICES, WEBSITES, CONTENT, SYSTEMS, TECHNOLOGIES, AI SYSTEMS, DIGITAL TOOLS, COMMUNICATIONS, PRIVATE LABEL SERVICES, CONTRACT MANUFACTURING SERVICES, OEM/ODM SERVICES, AND ALL RELATED MATERIALS ARE PROVIDED 'AS IS,' 'AS AVAILABLE,' AND 'WITH ALL FAULTS' WITHOUT WARRANTIES OF ANY KIND. COCO JOJO LLC EXPRESSLY DISCLAIMS ALL WARRANTIES INCLUDING: IMPLIED WARRANTIES OF MERCHANTABILITY; FITNESS FOR A PARTICULAR PURPOSE; NON-INFRINGEMENT; TITLE; ACCURACY; RELIABILITY; SECURITY; PERFORMANCE; COMPATIBILITY; AVAILABILITY; AND ERROR-FREE OPERATION. NO ORAL OR WRITTEN INFORMATION OR ADVICE GIVEN BY COCO JOJO LLC SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS."
      },
      {
        "type": "heading2",
        "text": "47. JURY TRIAL WAIVER"
      },
      {
        "type": "paragraph",
        "text": "TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, COCO JOJO LLC AND ALL USERS IRREVOCABLY WAIVE ANY AND ALL RIGHTS TO TRIAL BY JURY IN ANY LEGAL ACTION, PROCEEDING, CLAIM, COUNTERCLAIM, OR SUIT ARISING FROM OR RELATED TO THESE TERMS, PRODUCTS, SERVICES, OR ANY BUSINESS RELATIONSHIP WITH COCO JOJO LLC. THIS WAIVER APPLIES IN ALL FORUMS INCLUDING ARBITRATION, COURT, AND ANY OTHER PROCEEDING."
      },
      {
        "type": "heading2",
        "text": "48. LIMITATION OF LIABILITY"
      },
      {
        "type": "paragraph",
        "text": "TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, COCO JOJO LLC AND ITS AFFILIATES, OWNERS, OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR: LOST PROFITS; LOST REVENUE; LOST BUSINESS; LOST OPPORTUNITY; LOST INVESTMENT; LOSS OF GOODWILL; RETAILER DELISTING; MARKETPLACE SUSPENSION; ASIN SUPPRESSION; LOST RANKINGS; DATA LOSS; CYBER INCIDENTS INCLUDING RANSOMWARE, HACKED CRM, LEAKED EMAILS, OR CLOUD OUTAGES; REGULATORY FINES OR PENALTIES; RECALL COSTS; OR ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES."
      },
      {
        "type": "paragraph",
        "text": "TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY CUSTOMER TO COCO JOJO LLC DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100.00), WHICHEVER IS GREATER. THIS LIMITATION IS AN ESSENTIAL ELEMENT OF THE BASIS OF THE BARGAIN AND APPLIES NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY."
      },
      {
        "type": "heading2",
        "text": "49. WAIVER OF CONSEQUENTIAL & SPECIAL DAMAGES"
      },
      {
        "type": "paragraph",
        "text": "Users expressly and irrevocably waive all rights to seek or recover: lost opportunity, lost investment, lost prospective business, reputational damage, influencer relationship loss, marketplace ranking loss, ASIN valuation loss, marketplace service providers account suspension damages, retailer delisting damages, or any special, incidental, exemplary, or punitive damages - even if foreseeable or if COCO JOJO LLC was advised of their possibility. This waiver is a material inducement for COCO JOJO LLC to enter into commercial relationships."
      },
      {
        "type": "heading2",
        "text": "50. INDEMNIFICATION"
      },
      {
        "type": "paragraph",
        "text": "YOU AGREE TO FULLY DEFEND, INDEMNIFY, AND HOLD HARMLESS COCO JOJO LLC AND ITS AFFILIATES, OWNERS, OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, AGENTS, SUCCESSORS, AND ASSIGNS FROM ALL CLAIMS, ACTIONS, DAMAGES, LOSSES, LIABILITIES, PENALTIES, REGULATORY ACTIONS, ATTORNEY FEES, AND COSTS ARISING FROM: YOUR USE, RESALE, RELABELING, OR MODIFICATION OF PRODUCTS; YOUR PRODUCT CLAIMS, MARKETING, LABELING, OR ADVERTISING; YOUR REGULATORY NON-COMPLIANCE; YOUR IMPORT/EXPORT ACTIVITIES; YOUR MARKETPLACE ACTIVITIES; YOUR VIOLATION OF ANY APPLICABLE LAW; YOUR BREACH OF THESE TERMS; OR THIRD PARTY CLAIMS ARISING FROM YOUR COMMERCIAL EXPLOITATION OF PRODUCTS."
      },
      {
        "type": "heading2",
        "text": "51. OEM, PRIVATE LABEL & COMMERCIAL CLIENT INSURANCE REQUIREMENTS"
      },
      {
        "type": "paragraph",
        "text": "In particular, commercial customers, OEM/ODM clients, private label clients, and resellers are strongly advised and, for annual purchase volumes exceeding Twenty-Five Thousand Dollars ($25,000), expressly required to maintain the following insurance coverages during the term of any business relationship with COCO JOJO LLC:"
      },
      {
        "type": "listItem",
        "text": "Commercial general liability insurance: minimum $1,000,000 per occurrence / $2,000,000 aggregate"
      },
      {
        "type": "listItem",
        "text": "Product liability insurance: minimum $1,000,000 per occurrence / $2,000,000 aggregate"
      },
      {
        "type": "listItem",
        "text": "Product recall insurance: appropriate to the scale of customer's distribution operations"
      },
      {
        "type": "listItem",
        "text": "Cybersecurity and data breach insurance: minimum $500,000"
      },
      {
        "type": "listItem",
        "text": "Cargo and freight insurance: covering all shipments from COCO JOJO LLC facilities"
      },
      {
        "type": "paragraph",
        "text": "Upon request, commercial customers shall provide COCO JOJO LLC with certificates of insurance naming COCO JOJO LLC as an additional insured within ten (10) business days of request. Failure to maintain required coverage may result in suspension of services and additional contractual requirements. COCO JOJO LLC does not guarantee its own insurance policies will cover customer claims or downstream liabilities."
      },
      {
        "type": "heading2",
        "text": "52. FORCE MAJEURE"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC shall not be liable for any failure, delay, interruption, or degradation of performance arising from events beyond its reasonable control, including but not limited to:"
      },
      {
        "type": "listItem",
        "text": "Acts of God, natural disasters, floods, earthquakes, wildfires, and extreme weather events"
      },
      {
        "type": "listItem",
        "text": "Pandemics, epidemics, public health emergencies, biological events, and quarantines"
      },
      {
        "type": "listItem",
        "text": "Wars, armed conflicts, terrorism, civil unrest, cyber warfare, and geopolitical instability"
      },
      {
        "type": "listItem",
        "text": "Cyberattacks, hacking, malware, ransomware, AI system outages, and technology failures"
      },
      {
        "type": "listItem",
        "text": "Cloud infrastructure outages, hosting provider failures, and utility interruptions"
      },
      {
        "type": "listItem",
        "text": "Government actions, sanctions, trade restrictions, regulatory changes, and embargoes"
      },
      {
        "type": "listItem",
        "text": "Labor strikes, workforce shortages, and labor disruptions"
      },
      {
        "type": "listItem",
        "text": "Supply chain crises, raw material shortages, supplier insolvency, and supplier failures"
      },
      {
        "type": "listItem",
        "text": "Port congestion, container shortages, freight embargoes, and transportation disruptions"
      },
      {
        "type": "listItem",
        "text": "Banking disruptions, payment system failures, and financial system outages"
      },
      {
        "type": "listItem",
        "text": "Internet and telecommunications outages and failures"
      },
      {
        "type": "listItem",
        "text": "Tariff increases, trade disputes, and currency instability"
      },
      {
        "type": "heading2",
        "text": "53. MANDATORY INFORMAL DISPUTE RESOLUTION"
      },
      {
        "type": "paragraph",
        "text": "Before initiating any arbitration, lawsuit, or legal proceeding against COCO JOJO LLC, the parties agree to attempt good faith informal resolution for sixty (60) calendar days following written notice of the dispute. The notice must include the claimant's full legal name, contact information, detailed description of the dispute, supporting documentation, and specific relief requested. Completion of this process is a mandatory condition precedent to commencing any formal proceeding."
      },
      {
        "type": "heading2",
        "text": "54. MASS ARBITRATION & COORDINATED CLAIMS MANAGEMENT"
      },
      {
        "type": "paragraph",
        "text": "If twenty-five (25) or more similar claims are filed against COCO JOJO LLC by the same attorney, law firm, or coordinated counsel within any ninety (90) day period, claims shall be divided into sequential batches of no more than fifty (50) claims each, resolved sequentially, with batches selected on an alternating basis."
      },
      {
        "type": "paragraph",
        "text": "Users may not participate in coordinated or lawyer-driven mass-generated demands intended primarily to pressure settlement through arbitration fee structures, filing volume tactics, or coordinated fee pressure strategies. Such coordinated claims may be subject to sanctions, fee-shifting, and all available remedies. COCO JOJO LLC reserves the right to seek appropriate relief to enforce these procedures and to address duplicative, abusive, or improperly coordinated claims."
      },
      {
        "type": "heading2",
        "text": "55. FEDERAL ARBITRATION ACT SUPREMACY & DELEGATION CLAUSE"
      },
      {
        "type": "paragraph",
        "text": "Federal Arbitration Act Supremacy"
      },
      {
        "type": "paragraph",
        "text": "The parties expressly agree that the Federal Arbitration Act (\"FAA\"), 9 U.S.C. Sections 1 through 16, governs the interpretation, validity, enforceability, and execution of all arbitration provisions contained in these Terms and preempts any inconsistent state law to the fullest extent permitted by law. Any challenge to the enforceability of any arbitration provision under state law is expressly preempted by the FAA."
      },
      {
        "type": "paragraph",
        "text": "Delegation Clause"
      },
      {
        "type": "paragraph",
        "text": "The arbitrator, and not any court, administrative body, or governmental authority, shall have exclusive authority to resolve all disputes regarding the interpretation, applicability, enforceability, formation, unconscionability, arbitrability, or scope of this arbitration agreement, including but not limited to any claim that all or any part of this arbitration agreement is void, voidable, or unenforceable."
      },
      {
        "type": "paragraph",
        "text": "The parties expressly delegate all gateway questions of arbitrability to the arbitrator. This delegation clause is separable from the remainder of these Terms and shall survive any finding that other provisions are unenforceable."
      },
      {
        "type": "heading2",
        "text": "56. BINDING ARBITRATION & CLASS ACTION WAIVER"
      },
      {
        "type": "heading2",
        "text": "PLEASE READ THIS SECTION CAREFULLY - IT CONTAINS AN ARBITRATION AGREEMENT, CLASS ACTION WAIVER, AND PAGA WAIVER."
      },
      {
        "type": "paragraph",
        "text": "EXCEPT FOR SMALL CLAIMS COURT MATTERS, ALL DISPUTES ARISING FROM THESE TERMS, PRODUCTS, SERVICES, OR ANY BUSINESS RELATIONSHIP WITH COCO JOJO LLC SHALL BE RESOLVED EXCLUSIVELY THROUGH BINDING INDIVIDUAL ARBITRATION ADMINISTERED BY JAMS OR AAA UNDER APPLICABLE COMMERCIAL ARBITRATION RULES, SEATED IN ORANGE COUNTY, CALIFORNIA. THE FAA GOVERNS THIS ARBITRATION AGREEMENT."
      },
      {
        "type": "paragraph",
        "text": "Users irrevocably waive all rights to:"
      },
      {
        "type": "listItem",
        "text": "Trial by jury in any court or legal proceeding"
      },
      {
        "type": "listItem",
        "text": "Participating in or leading any class action proceeding"
      },
      {
        "type": "listItem",
        "text": "Participating in any representative or consolidated action"
      },
      {
        "type": "listItem",
        "text": "Participating in any class arbitration proceeding"
      },
      {
        "type": "listItem",
        "text": "Participating in any coordinated mass tort proceeding"
      },
      {
        "type": "listItem",
        "text": "Any bellwether trial structure or coordinated litigation strategy"
      },
      {
        "type": "paragraph",
        "text": "California law governs these Terms and all disputes without regard to conflicts of laws provisions. The arbitrator's award is final and binding and may be entered as a judgment in any court of competent jurisdiction."
      },
      {
        "type": "heading2",
        "text": "57. CALIFORNIA PAGA WAIVER"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by applicable law, users who are or were employees, independent contractors, interns, ambassadors, or affiliates of COCO JOJO LLC expressly waive the right to bring or participate in any representative action under California's Private Attorneys General Act (PAGA), Labor Code Section 2698 et seq., whether in arbitration or in court."
      },
      {
        "type": "paragraph",
        "text": "Any individual PAGA claim that may not be waived under applicable law shall be brought solely in arbitration on an individual basis. Any representative PAGA claim that cannot legally be sent to arbitration shall be stayed pending resolution of the individual PAGA claim in arbitration."
      },
      {
        "type": "paragraph",
        "text": "Nothing in this section shall be construed to waive any non-waivable right to report labor violations to the California Labor Commissioner or any other government agency."
      },
      {
        "type": "heading2",
        "text": "58. INJUNCTIVE RELIEF CARVEOUT"
      },
      {
        "type": "paragraph",
        "text": "Notwithstanding any arbitration provision, informal dispute resolution requirement, or other limitation contained in these Terms, COCO JOJO LLC may seek temporary restraining orders, preliminary injunctions, emergency equitable relief, injunctive relief, and all other available emergency remedies in any court of competent jurisdiction - without prior notice, without posting bond, and without proving actual damages - to protect:"
      },
      {
        "type": "listItem",
        "text": "Proprietary formulations, trade secrets, and confidential manufacturing processes"
      },
      {
        "type": "listItem",
        "text": "Intellectual property rights including trademarks, copyrights, and proprietary systems"
      },
      {
        "type": "listItem",
        "text": "Confidential business information and proprietary operational data"
      },
      {
        "type": "listItem",
        "text": "Customer and supplier relationships and confidential commercial information"
      },
      {
        "type": "listItem",
        "text": "Business operations, personnel, and physical and digital assets"
      },
      {
        "type": "paragraph",
        "text": "This injunctive relief carveout is severable from the arbitration provisions and shall survive any finding that other provisions are invalid or unenforceable."
      },
      {
        "type": "heading2",
        "text": "59. ALTERNATIVE VENUE & ATTORNEY FEES"
      },
      {
        "type": "paragraph",
        "text": "If arbitration is unenforceable for a particular claim, exclusive jurisdiction and venue shall reside in the state and federal courts of Orange County, California. Users irrevocably consent to personal jurisdiction in Orange County, California. The prevailing party in any arbitration, litigation, or enforcement proceeding shall be entitled to recover reasonable attorney fees, arbitration costs, court costs, expert fees, and related costs. Users bringing claims without substantial merit or in bad faith may be liable for COCO JOJO LLC's full attorney fees."
      },
      {
        "type": "heading2",
        "text": "60. LIMITATION PERIOD"
      },
      {
        "type": "paragraph",
        "text": "Any claim arising from or related to these Terms, products, services, or any transaction with COCO JOJO LLC must be commenced within one (1) year after the event giving rise to the claim. Claims not commenced within this period are permanently barred. This shortened limitations period is a material term and constitutes a knowing and voluntary waiver of any longer statute of limitations."
      },
      {
        "type": "heading2",
        "text": "61. CONFIDENTIALITY"
      },
      {
        "type": "paragraph",
        "text": "Non-public business information disclosed by COCO JOJO LLC - including pricing, formulations, manufacturing methods, sourcing information, business strategies, trade secrets, and operational information - is confidential. Users agree not to disclose, misuse, or exploit any COCO JOJO LLC confidential information without prior written authorization. Confidentiality obligations survive termination of any relationship with COCO JOJO LLC for a period of five (5) years, and indefinitely with respect to trade secrets."
      },
      {
        "type": "heading2",
        "text": "62. ASSIGNMENT, NO WAIVER, CUMULATIVE RIGHTS & SEVERABILITY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC may freely assign all rights and obligations without restriction. Users may not assign rights without prior written consent. Failure to enforce any provision shall not constitute a waiver. All rights and remedies are cumulative. If any provision is determined invalid or unenforceable, it shall be modified to the minimum extent necessary to make it enforceable while preserving original intent, and all remaining provisions shall remain in full force."
      },
      {
        "type": "heading2",
        "text": "63. SURVIVAL & ENTIRE AGREEMENT"
      },
      {
        "type": "paragraph",
        "text": "All provisions that by their nature should survive termination shall survive, including: intellectual property, all payment obligations, indemnification, arbitration, the FAA supremacy and delegation clause, the PAGA waiver, liability limitations, confidentiality, governing law, class action waivers, jury trial waivers, enforcement rights, and the limitation of claims period."
      },
      {
        "type": "paragraph",
        "text": "These Terms, together with the COCO JOJO LLC Privacy Policy and any separately executed written agreement, constitute the complete and entire agreement between users and COCO JOJO LLC and supersede all prior agreements, representations, warranties, negotiations, and understandings, whether oral or written."
      },
      {
        "type": "heading2",
        "text": "64. MAXIMUM ENFORCEABILITY"
      },
      {
        "type": "paragraph",
        "text": "These Terms shall be interpreted and enforced to the maximum extent permitted under applicable law to protect the rights, operations, systems, intellectual property, personnel, assets, and business interests of COCO JOJO LLC. Any provision determined to be invalid, illegal, or unenforceable shall be automatically modified to the minimum extent necessary to make it enforceable while preserving the original intent."
      },
      {
        "type": "heading2",
        "text": "65. CONTACT INFORMATION"
      },
      {
        "type": "heading2",
        "text": "COCO JOJO LLC"
      },
      {
        "type": "paragraph",
        "text": "General: support@cocojojo.com | Privacy: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Website: www.COCOJOJO.com"
      },
      {
        "type": "paragraph",
        "text": "www.COCOJOJO.com | support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC - All Rights Reserved | Terms of Service - Version 5.0 - May 27, 2026"
      }
    ]
  },
  {
    "slug": "accessibility-statement",
    "title": "Accessibility Statement",
    "footerLabel": "Accessibility Statement",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "COCO JOJO LLC is committed to ensuring equal digital access for all users, including individuals with disabilities, and to complying with all applicable accessibility laws and standards.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC is committed to ensuring equal digital access for all users, including individuals with disabilities, and to complying with all applicable accessibility laws and standards."
      },
      {
        "type": "heading2",
        "text": "1. OUR COMMITMENT TO ACCESSIBILITY"
      },
      {
        "type": "paragraph",
        "text": "Equal access for all users - ongoing, enforceable, and measurable"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC is committed to ensuring digital accessibility for all users, including individuals with disabilities, individuals using assistive technologies, and individuals with diverse access needs. We recognize that accessibility is not a one-time implementation but a continuous obligation, and we are committed to the ongoing evaluation, improvement, and maintenance of accessible digital experiences across all our platforms."
      },
      {
        "type": "paragraph",
        "text": "Our commitment to accessibility extends to all digital properties operated by COCO JOJO LLC including our primary website, ecommerce systems, wholesale customer portals, private label client portals, product ordering systems, customer support systems, AI-assisted tools, digital marketing materials, and all related online services and communications."
      },
      {
        "type": "heading2",
        "text": "2. ACCESSIBILITY STANDARDS & CONFORMANCE"
      },
      {
        "type": "paragraph",
        "text": "WCAG 2.1 AA, ADA, Section 508, California, and international standards"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC strives to conform to the following accessibility standards, guidelines, and legal requirements, without limitation:"
      },
      {
        "type": "listItem",
        "text": "Web Content Accessibility Guidelines (WCAG) 2.1 Level AA - published by the World Wide Web Consortium (W3C), covering perceivability, operability, understandability, and robustness of digital content"
      },
      {
        "type": "listItem",
        "text": "Web Content Accessibility Guidelines (WCAG) 2.2 Level AA - the current version of WCAG, incorporating additional success criteria including focus visibility, target size, and accessible authentication"
      },
      {
        "type": "listItem",
        "text": "Americans with Disabilities Act (ADA), Title III - prohibiting discrimination on the basis of disability in places of public accommodation, including commercial websites"
      },
      {
        "type": "listItem",
        "text": "Section 508 of the Rehabilitation Act - federal accessibility requirements for electronic and information technology, applicable to the extent COCO JOJO LLC provides services to federal contractors or agencies"
      },
      {
        "type": "listItem",
        "text": "California Unruh Civil Rights Act (California Civil Code Section51 et seq.) - prohibiting disability discrimination in business establishments operating in California"
      },
      {
        "type": "listItem",
        "text": "California Government Code Section11135 and related regulations - California accessibility standards for programs and services"
      },
      {
        "type": "listItem",
        "text": "European Accessibility Act (EAA) and EN 301 549 - European accessibility standards applicable to digital products and services offered in EU markets"
      },
      {
        "type": "listItem",
        "text": "Accessible Rich Internet Applications (ARIA) specifications - technical standards for accessible web applications"
      },
      {
        "type": "paragraph",
        "text": "Conformance level: COCO JOJO LLC targets WCAG 2.1 Level AA conformance as a minimum standard and is actively working toward WCAG 2.2 Level AA conformance across all digital properties."
      },
      {
        "type": "heading2",
        "text": "3. SCOPE OF THIS STATEMENT"
      },
      {
        "type": "paragraph",
        "text": "All digital properties, systems, and communications operated by COCO JOJO LLC"
      },
      {
        "type": "paragraph",
        "text": "This Accessibility Statement applies to all digital properties owned, operated, managed, licensed, or controlled by COCO JOJO LLC, including but not limited to:"
      },
      {
        "type": "listItem",
        "text": "Primary website: www.COCOJOJO.com and all subdomains"
      },
      {
        "type": "listItem",
        "text": "Ecommerce and product ordering systems"
      },
      {
        "type": "listItem",
        "text": "Wholesale customer account portals and private label client portals"
      },
      {
        "type": "listItem",
        "text": "Customer support systems, live chat, and AI-assisted communication tools"
      },
      {
        "type": "listItem",
        "text": "Email communications, marketing communications, and digital newsletters"
      },
      {
        "type": "listItem",
        "text": "Product documentation, technical data sheets, and digital certificates"
      },
      {
        "type": "listItem",
        "text": "Mobile-optimized website experience"
      },
      {
        "type": "listItem",
        "text": "Digital forms, checkout systems, and payment interfaces"
      },
      {
        "type": "paragraph",
        "text": "Third party content, plugins, payment gateways, embedded applications, marketplace integrations, social media platforms, external links, and independently operated external technologies may not be fully controlled by COCO JOJO LLC. We are not responsible for the accessibility of third party systems, but we take commercially reasonable steps to select and work with vendors who prioritize accessibility."
      },
      {
        "type": "heading2",
        "text": "4. ACCESSIBILITY FEATURES & TECHNICAL IMPLEMENTATION"
      },
      {
        "type": "paragraph",
        "text": "Current features and ongoing improvements across all digital properties"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC has implemented or is actively working to implement the following accessibility features and technical measures across its digital properties, where commercially reasonable:"
      },
      {
        "type": "paragraph",
        "text": "Navigation & Structure:"
      },
      {
        "type": "listItem",
        "text": "Keyboard navigation support for all interactive elements without requiring a mouse"
      },
      {
        "type": "listItem",
        "text": "Logical, consistent navigation structure with clear heading hierarchy (H1 through H6)"
      },
      {
        "type": "listItem",
        "text": "Skip navigation links allowing keyboard and screen reader users to bypass repetitive content"
      },
      {
        "type": "listItem",
        "text": "Descriptive page titles for every page to support orientation and navigation"
      },
      {
        "type": "listItem",
        "text": "Visible focus indicators for all keyboard-interactive elements"
      },
      {
        "type": "listItem",
        "text": "Breadcrumb navigation and clear site structure"
      },
      {
        "type": "paragraph",
        "text": "Visual & Readability:"
      },
      {
        "type": "listItem",
        "text": "Color contrast optimization meeting or exceeding WCAG 2.1 AA minimum ratios (4.5:1 for normal text, 3:1 for large text)"
      },
      {
        "type": "listItem",
        "text": "Text resizing support up to 200% without loss of content or functionality"
      },
      {
        "type": "listItem",
        "text": "No content that relies solely on color to convey meaning"
      },
      {
        "type": "listItem",
        "text": "Consistent, readable typography and font sizing"
      },
      {
        "type": "listItem",
        "text": "Avoidance of flashing or strobing content that could trigger seizures"
      },
      {
        "type": "listItem",
        "text": "No content that flashes more than three times per second"
      },
      {
        "type": "paragraph",
        "text": "Images & Media:"
      },
      {
        "type": "listItem",
        "text": "Alternative text (alt text) for all meaningful images and graphics"
      },
      {
        "type": "listItem",
        "text": "Empty alt text for decorative images to prevent unnecessary screen reader announcements"
      },
      {
        "type": "listItem",
        "text": "Captions and transcripts for video and audio content where applicable"
      },
      {
        "type": "listItem",
        "text": "Descriptive labels for charts, graphs, infographics, and data visualizations"
      },
      {
        "type": "paragraph",
        "text": "Forms & Interaction:"
      },
      {
        "type": "listItem",
        "text": "Descriptive labels for all form fields, inputs, and interactive controls"
      },
      {
        "type": "listItem",
        "text": "Clear error identification, error messages, and correction guidance"
      },
      {
        "type": "listItem",
        "text": "Sufficient time for completing forms and transactions, with timeout warnings"
      },
      {
        "type": "listItem",
        "text": "Accessible CAPTCHA alternatives or accessible authentication methods"
      },
      {
        "type": "listItem",
        "text": "Form validation that does not rely solely on visual cues"
      },
      {
        "type": "paragraph",
        "text": "Assistive Technology Compatibility:"
      },
      {
        "type": "listItem",
        "text": "Screen reader compatibility improvements for major screen reader technologies including JAWS, NVDA, VoiceOver, and TalkBack"
      },
      {
        "type": "listItem",
        "text": "ARIA (Accessible Rich Internet Applications) landmark roles, labels, and attributes"
      },
      {
        "type": "listItem",
        "text": "Semantic HTML markup for proper assistive technology interpretation"
      },
      {
        "type": "listItem",
        "text": "Support for browser-level text scaling and zoom functionality"
      },
      {
        "type": "listItem",
        "text": "Compatibility with voice recognition and voice navigation software"
      },
      {
        "type": "paragraph",
        "text": "Mobile & Responsive Accessibility:"
      },
      {
        "type": "listItem",
        "text": "Responsive design ensuring accessibility across desktop, tablet, and mobile devices"
      },
      {
        "type": "listItem",
        "text": "Touch target sizes meeting or exceeding WCAG 2.2 minimum requirements"
      },
      {
        "type": "listItem",
        "text": "Support for device-level accessibility settings and preferences"
      },
      {
        "type": "listItem",
        "text": "Portrait and landscape orientation support without loss of content"
      },
      {
        "type": "heading2",
        "text": "5. KNOWN LIMITATIONS & ONGOING REMEDIATION"
      },
      {
        "type": "paragraph",
        "text": "Transparent disclosure of limitations with active remediation commitments"
      },
      {
        "type": "paragraph",
        "text": "Despite our ongoing efforts, some areas of our digital properties may not yet fully conform to WCAG 2.1 Level AA standards. Known or potential limitations include:"
      },
      {
        "type": "listItem",
        "text": "Certain third party embedded content including payment processing interfaces, social media widgets, and marketplace integrations may not fully conform to WCAG 2.1 AA standards. We are actively working with these vendors to improve accessibility."
      },
      {
        "type": "listItem",
        "text": "Some older product documentation, historical technical data sheets, and legacy PDF documents may have accessibility limitations. We are progressively updating these documents to meet current accessibility standards."
      },
      {
        "type": "listItem",
        "text": "Certain dynamically generated content including AI-assisted recommendations, real-time inventory systems, and personalized product displays may have accessibility gaps that we are actively addressing."
      },
      {
        "type": "listItem",
        "text": "Some complex data tables and specification charts may require remediation for full screen reader compatibility."
      },
      {
        "type": "paragraph",
        "text": "We are committed to systematically identifying and remediating accessibility barriers across all our digital properties. Remediation is prioritized based on user impact, with high-impact barriers addressed on the fastest available timeline."
      },
      {
        "type": "heading2",
        "text": "6. ACCESSIBILITY TESTING & EVALUATION"
      },
      {
        "type": "paragraph",
        "text": "Ongoing, multi-method evaluation to identify and resolve barriers"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC evaluates the accessibility of our digital properties through the following methods on an ongoing basis:"
      },
      {
        "type": "listItem",
        "text": "Automated accessibility scanning using industry-standard tools to identify technical WCAG violations"
      },
      {
        "type": "listItem",
        "text": "Manual accessibility testing by team members trained in accessibility evaluation techniques"
      },
      {
        "type": "listItem",
        "text": "Screen reader testing using major screen reader technologies including JAWS, NVDA, and VoiceOver"
      },
      {
        "type": "listItem",
        "text": "Keyboard-only navigation testing to identify focus management and navigation issues"
      },
      {
        "type": "listItem",
        "text": "Color contrast analysis using WCAG-compliant contrast checking tools"
      },
      {
        "type": "listItem",
        "text": "Mobile accessibility testing across iOS and Android platforms"
      },
      {
        "type": "listItem",
        "text": "Review of user-submitted accessibility feedback to identify real-world barriers"
      },
      {
        "type": "listItem",
        "text": "Periodic third party accessibility audits as operationally feasible"
      },
      {
        "type": "paragraph",
        "text": "Our goal is to conduct a comprehensive accessibility review of all primary website pages and customer-facing systems at least annually, with targeted reviews of new or updated features at the time of deployment."
      },
      {
        "type": "heading2",
        "text": "7. ACCESSIBILITY FEEDBACK, COMPLAINTS & FORMAL PROCEDURE"
      },
      {
        "type": "paragraph",
        "text": "Clear process - acknowledgment within 2 business days, resolution within 14"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC takes accessibility complaints seriously and has established a formal procedure for receiving, acknowledging, investigating, and resolving accessibility concerns."
      },
      {
        "type": "paragraph",
        "text": "Step 1 - Report the Issue:"
      },
      {
        "type": "paragraph",
        "text": "If you experience difficulty accessing any portion of our website, systems, services, products, digital content, or communications, please contact us using any of the following methods:"
      },
      {
        "type": "listItem",
        "text": "Email: support@cocojojo.com (subject line: 'Accessibility Issue Report')"
      },
      {
        "type": "listItem",
        "text": "Phone: (949) 610-7164"
      },
      {
        "type": "paragraph",
        "text": "To help us respond as efficiently and effectively as possible, please include the following information in your report:"
      },
      {
        "type": "listItem",
        "text": "The specific webpage, URL, feature, or system you experienced difficulty accessing"
      },
      {
        "type": "listItem",
        "text": "A description of the accessibility barrier or issue encountered"
      },
      {
        "type": "listItem",
        "text": "The device, browser, operating system, and version you were using"
      },
      {
        "type": "listItem",
        "text": "The assistive technology used, if applicable (e.g., screen reader name and version, voice control software)"
      },
      {
        "type": "listItem",
        "text": "Your preferred method of contact and communication format"
      },
      {
        "type": "listItem",
        "text": "Any additional context that would help us understand and replicate the issue"
      },
      {
        "type": "paragraph",
        "text": "Step 2 - Acknowledgment:"
      },
      {
        "type": "paragraph",
        "text": "We will acknowledge receipt of all accessibility feedback and complaints within two (2) business days of receipt."
      },
      {
        "type": "paragraph",
        "text": "Step 3 - Investigation and Response:"
      },
      {
        "type": "paragraph",
        "text": "We will investigate the reported accessibility issue and provide a substantive response within fourteen (14) calendar days, including: confirmation of the issue or explanation if the issue could not be replicated; the remediation steps we plan to take or have taken; an estimated timeline for resolution; and an offer of alternative accessible formats or accommodations where applicable."
      },
      {
        "type": "paragraph",
        "text": "Step 4 - Alternative Accessible Formats:"
      },
      {
        "type": "paragraph",
        "text": "Pending full remediation, we will make commercially reasonable efforts to provide the information, product, service, or assistance you need through an alternative accessible communication method, including but not limited to: plain text documents, large-print versions, accessible PDF documents, direct telephone assistance, email-based assistance, or other accommodations consistent with applicable law."
      },
      {
        "type": "paragraph",
        "text": "Step 5 - Formal Escalation:"
      },
      {
        "type": "paragraph",
        "text": "If you are not satisfied with our response to your accessibility complaint, you may escalate the matter by requesting a formal review. To escalate, email support@cocojojo.com with subject line 'Accessibility Complaint Escalation.' We will respond to escalated complaints within fourteen (14) calendar days with a final written determination."
      },
      {
        "type": "heading2",
        "text": "8. EXTERNAL COMPLAINTS & REGULATORY ESCALATION"
      },
      {
        "type": "paragraph",
        "text": "Users retain the right to file complaints with external authorities"
      },
      {
        "type": "paragraph",
        "text": "If COCO JOJO LLC does not resolve your accessibility concern to your satisfaction, you retain the right to file a complaint with the following regulatory authorities and agencies, without waiving any other right:"
      },
      {
        "type": "paragraph",
        "text": "U.S. Department of Justice - ADA Title III Complaints:"
      },
      {
        "type": "listItem",
        "text": "Website: ada.gov"
      },
      {
        "type": "listItem",
        "text": "ADA Information Line: 1-800-514-0301 (voice) | 1-833-610-1264 (TTY)"
      },
      {
        "type": "paragraph",
        "text": "U.S. Access Board - Section 508 and Federal Accessibility:"
      },
      {
        "type": "listItem",
        "text": "Website: access-board.gov"
      },
      {
        "type": "paragraph",
        "text": "California Department of Fair Employment and Housing (DFEH) - Unruh Act Complaints:"
      },
      {
        "type": "listItem",
        "text": "Website: dfeh.ca.gov"
      },
      {
        "type": "paragraph",
        "text": "European Accessibility Act Complaints (EU users):"
      },
      {
        "type": "listItem",
        "text": "Contact the national market surveillance authority in your EU member state"
      },
      {
        "type": "paragraph",
        "text": "We strongly encourage users to contact us directly at support@cocojojo.com before filing a formal complaint with any external authority. We are committed to resolving accessibility issues in good faith and as quickly as commercially feasible."
      },
      {
        "type": "heading2",
        "text": "9. LEGAL DISCLAIMER & LIMITATION OF LIABILITY"
      },
      {
        "type": "paragraph",
        "text": "Maximum protection for COCO JOJO LLC consistent with accessibility obligations"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC makes commercially reasonable efforts to conform to applicable accessibility standards; however, COCO JOJO LLC does not warrant or guarantee that its websites, systems, applications, digital content, or communications are fully accessible to all users in all circumstances, on all devices, using all assistive technologies, or in compliance with all versions of all accessibility standards at all times."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC does not warrant uninterrupted accessibility, compatibility with all assistive technologies, conformance with all versions of WCAG or other standards, or error-free operation of all digital accessibility features at all times."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC is not liable for accessibility limitations caused by or arising from:"
      },
      {
        "type": "listItem",
        "text": "Third party content, plugins, integrations, payment systems, or independently operated external technologies not within COCO JOJO LLC's reasonable control"
      },
      {
        "type": "listItem",
        "text": "User-side device, browser, operating system, assistive technology, or network configuration issues"
      },
      {
        "type": "listItem",
        "text": "Temporary accessibility interruptions caused by maintenance, updates, security deployments, or force majeure events"
      },
      {
        "type": "listItem",
        "text": "Accessibility barriers in legacy content or historical documents that predate current accessibility standards"
      },
      {
        "type": "listItem",
        "text": "Commercially unreasonable modifications that would fundamentally alter the nature of a product, service, or system"
      },
      {
        "type": "listItem",
        "text": "Modifications that would impose undue financial or operational burden disproportionate to the accessibility benefit"
      },
      {
        "type": "paragraph",
        "text": "Nothing in this Accessibility Statement constitutes an admission of non-compliance with any applicable law, an acknowledgment of any specific accessibility deficiency, or a waiver of any legal defense, right, or position available to COCO JOJO LLC. All rights reserved."
      },
      {
        "type": "paragraph",
        "text": "Disputes relating to this Accessibility Statement are subject to the dispute resolution provisions, arbitration agreement, and governing law provisions contained in the COCO JOJO LLC Terms of Service (Version 5.0), incorporated herein by reference."
      },
      {
        "type": "heading2",
        "text": "10. THIRD PARTY VENDOR ACCESSIBILITY POLICY"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC's requirements for third party digital service providers"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC takes commercially reasonable steps to select, evaluate, and work with third party vendors, technology providers, and service partners who demonstrate a commitment to digital accessibility. When procuring new digital tools, platforms, integrations, or technologies, COCO JOJO LLC considers accessibility conformance as a relevant evaluation criterion."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC requests accessibility conformance information including Voluntary Product Accessibility Templates (VPATs) or equivalent accessibility documentation from material third party vendors where accessibility is operationally relevant. However, COCO JOJO LLC cannot guarantee third party vendor accessibility conformance and is not responsible for third party systems' accessibility failures."
      },
      {
        "type": "heading2",
        "text": "11. REASONABLE ACCOMMODATION REQUESTS"
      },
      {
        "type": "paragraph",
        "text": "Alternative formats, direct assistance, and individualized accommodations"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC will provide reasonable accommodations and accessible alternatives for individuals with disabilities who encounter accessibility barriers when accessing our products, services, or digital content, to the extent required by applicable law and commercially feasible."
      },
      {
        "type": "paragraph",
        "text": "Available accommodation options may include, without limitation:"
      },
      {
        "type": "listItem",
        "text": "Providing product information, technical documentation, or ordering assistance via telephone at (949) 610-7164"
      },
      {
        "type": "listItem",
        "text": "Providing documents in alternative accessible formats including plain text, large print, or structured accessible PDF upon request"
      },
      {
        "type": "listItem",
        "text": "Providing direct email assistance for orders, quotations, or product inquiries that cannot be completed through the standard online interface"
      },
      {
        "type": "listItem",
        "text": "Providing written transcripts of audio or video content upon request"
      },
      {
        "type": "listItem",
        "text": "Accommodating preferred communication methods and formats where commercially reasonable"
      },
      {
        "type": "paragraph",
        "text": "To request a specific accommodation, contact us at support@cocojojo.com with subject line 'Accessibility Accommodation Request,' or call (949) 610-7164. We will respond within two (2) business days."
      },
      {
        "type": "heading2",
        "text": "12. CONTINUOUS IMPROVEMENT & GOVERNANCE"
      },
      {
        "type": "paragraph",
        "text": "Formal commitment to accessibility as an ongoing operational priority"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC treats digital accessibility as an ongoing operational priority, not a one-time project. Our continuous improvement program includes:"
      },
      {
        "type": "listItem",
        "text": "Annual comprehensive accessibility review of all primary customer-facing digital properties"
      },
      {
        "type": "listItem",
        "text": "Accessibility review of all new website features, digital tools, and system updates at the time of deployment"
      },
      {
        "type": "listItem",
        "text": "Regular review and updating of this Accessibility Statement to reflect current conformance status and improvements"
      },
      {
        "type": "listItem",
        "text": "Staff awareness of accessibility obligations and user accommodation procedures"
      },
      {
        "type": "listItem",
        "text": "User feedback integration - accessibility reports from users inform our remediation prioritization"
      },
      {
        "type": "listItem",
        "text": "Vendor accessibility assessment as part of new technology procurement processes"
      },
      {
        "type": "paragraph",
        "text": "This Accessibility Statement is reviewed and updated at least annually. Material changes to our accessibility conformance status or procedures will be reflected in an updated Statement with a new effective date."
      },
      {
        "type": "heading2",
        "text": "13. CONTACT INFORMATION"
      },
      {
        "type": "paragraph",
        "text": "All accessibility inquiries, complaints, and accommodation requests"
      },
      {
        "type": "paragraph",
        "text": "Accessibility Officer - COCO JOJO LLC"
      },
      {
        "type": "paragraph",
        "text": "All Accessibility Inquiries: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Subject line: 'Accessibility Issue Report' / 'Accessibility Accommodation Request' / 'Accessibility Complaint'"
      },
      {
        "type": "paragraph",
        "text": "Phone: (949) 610-7164"
      },
      {
        "type": "paragraph",
        "text": "General Support: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Website: www.COCOJOJO.com"
      },
      {
        "type": "paragraph",
        "text": "Acknowledgment within 2 business days - Substantive response within 14 calendar days - Alternative format assistance available upon request"
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC - All Rights Reserved | Accessibility Statement v1.0 - May 27, 2026"
      }
    ]
  },
  {
    "slug": "ccpa-privacy-notice",
    "title": "CCPA Privacy Notice",
    "footerLabel": "CCPA Privacy Notice",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": null,
    "summary": "California privacy rights and request procedures for COCOJOJO customers, visitors, and other California residents.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC respects the privacy rights of California residents pursuant to the California Consumer Privacy Act (\"CCPA\") as amended by the California Privacy Rights Act (\"CPRA\"), along with other applicable privacy laws including GDPR, APPI, PIPEDA, and related international privacy frameworks."
      },
      {
        "type": "paragraph",
        "text": "The compliance systems, applications, technologies, and operational tools used to support privacy rights requests on this website may collect certain information including IP addresses, browser identifiers, device information, timestamps, verification data, and email addresses in order to authenticate, process, document, fulfill, maintain security for, and comply with applicable privacy request obligations."
      },
      {
        "type": "paragraph",
        "text": "For additional details regarding our data practices, please review our Privacy Policy and Terms of Service, available at www.COCOJOJO.com."
      },
      {
        "type": "paragraph",
        "text": "Response Timeline: COCO JOJO LLC will acknowledge verifiable consumer requests within the timeframe required by applicable law. We aim to provide substantive responses within forty five (45) calendar days of receipt of a verifiable request. Where reasonably necessary due to complexity, volume, operational requirements, verification requirements, cybersecurity review, legal obligations, or circumstances permitted under applicable law, we may extend the response period by an additional forty five (45) calendar days and will notify you of such extension."
      },
      {
        "type": "paragraph",
        "text": "YOUR PRIVACY RIGHTS"
      },
      {
        "type": "paragraph",
        "text": "Depending on your jurisdiction and applicable law, you may have the following rights"
      },
      {
        "type": "paragraph",
        "text": "Depending on your jurisdiction and applicable law, you may have the following rights regarding your personal information:"
      },
      {
        "type": "paragraph",
        "text": "Right to Know / Access"
      },
      {
        "type": "paragraph",
        "text": "You may request access to the categories and specific pieces of personal information we have collected, processed, used, disclosed, shared, or retained about you, including the categories of sources, business or commercial purposes, and categories of third parties with whom information was shared."
      },
      {
        "type": "paragraph",
        "text": "Right to Correct / Rectification"
      },
      {
        "type": "paragraph",
        "text": "You may request correction or updating of inaccurate or incomplete personal information associated with your account or interactions with COCO JOJO LLC. We will implement verified corrections within forty-five (45) calendar days of verification."
      },
      {
        "type": "paragraph",
        "text": "Edit Your Account Information - Log in to your account to update your details directly"
      },
      {
        "type": "paragraph",
        "text": "Right to Data Portability"
      },
      {
        "type": "paragraph",
        "text": "You may request a copy of the personal information we maintain about you in a portable and commercially reasonable format, where technically feasible. Available downloadable request categories may include:"
      },
      {
        "type": "listItem",
        "text": "Personal Information"
      },
      {
        "type": "listItem",
        "text": "Order History"
      },
      {
        "type": "listItem",
        "text": "Account Information"
      },
      {
        "type": "listItem",
        "text": "Customer Requests"
      },
      {
        "type": "listItem",
        "text": "Commercial Transaction Records"
      },
      {
        "type": "paragraph",
        "text": "Download Your Data - Submit a data portability request to support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Right to Request a Personal Data Report"
      },
      {
        "type": "paragraph",
        "text": "You may request a report containing the personal information associated with your account, purchases, communications, or interactions with our systems."
      },
      {
        "type": "paragraph",
        "text": "Request a Personal Data Report - Email support@cocojojo.com - Subject: 'Personal Data Report Request'"
      },
      {
        "type": "paragraph",
        "text": "Right to Opt Out of Sale or Sharing"
      },
      {
        "type": "paragraph",
        "text": "You may direct us not to sell or share your personal information for cross-context behavioral advertising, audience targeting, analytics, retargeting, or related advertising activities as defined under applicable California law."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC does not sell personal information for monetary compensation. However, certain advertising, analytics, attribution, audience matching, and tracking technologies may constitute \"sharing\" under CPRA."
      },
      {
        "type": "paragraph",
        "text": "To opt out of the sharing of personal information for cross-context behavioral advertising:"
      },
      {
        "type": "listItem",
        "text": "Email support@cocojojo.com with subject line: 'Do Not Sell or Share My Personal Information'"
      },
      {
        "type": "listItem",
        "text": "Manage cookie preferences through our cookie preference center at www.COCOJOJO.com"
      },
      {
        "type": "listItem",
        "text": "Use the Global Privacy Control (GPC) signal in your browser - COCO JOJO LLC honors GPC opt-out signals as required under California law (11 CCR Section7025)"
      },
      {
        "type": "paragraph",
        "text": "GPC Notice: COCO JOJO LLC recognizes and honors Global Privacy Control (GPC) signals transmitted by your browser as a valid opt-out of the sale or sharing of personal information for cross-context behavioral advertising, consistent with California CPRA regulations."
      },
      {
        "type": "paragraph",
        "text": "Do Not Sell or Share My Personal Information - Email support@cocojojo.com - Subject: 'Do Not Sell or Share'"
      },
      {
        "type": "paragraph",
        "text": "Right to Limit Use of Sensitive Personal Information"
      },
      {
        "type": "paragraph",
        "text": "Where applicable, you may request limitations regarding the use or disclosure of sensitive personal information beyond purposes reasonably necessary to provide requested services, ensure security, prevent fraud, comply with legal obligations, or conduct legitimate operational activities."
      },
      {
        "type": "paragraph",
        "text": "Request Limitation of Sensitive Personal Information - Email support@cocojojo.com - Subject: 'Limit Use of Sensitive PI'"
      },
      {
        "type": "paragraph",
        "text": "Right to Deletion / Right to be Forgotten"
      },
      {
        "type": "paragraph",
        "text": "You may request deletion of your personal information, subject to applicable legal, contractual, operational, tax, fraud prevention, regulatory, dispute resolution, cybersecurity, safety, quality assurance, recordkeeping, and compliance exceptions permitted under applicable law."
      },
      {
        "type": "paragraph",
        "text": "Please note the following before submitting a deletion request:"
      },
      {
        "type": "listItem",
        "text": "Certain records may be retained where legally required or reasonably necessary for legitimate business purposes including tax compliance, fraud prevention, legal proceedings, and regulatory obligations"
      },
      {
        "type": "listItem",
        "text": "Deletion requests may result in permanent account closure and loss of access to services, order history, support records, warranty records, loyalty benefits, and related systems"
      },
      {
        "type": "listItem",
        "text": "Deletion of records required for pending legal or arbitration proceedings may not be possible until proceedings are concluded"
      },
      {
        "type": "listItem",
        "text": "Business-to-business commercial records may be subject to longer retention under applicable commercial law"
      },
      {
        "type": "paragraph",
        "text": "Request Personal Data Deletion - Email support@cocojojo.com - Subject: 'Data Deletion Request'"
      },
      {
        "type": "paragraph",
        "text": "VERIFICATION REQUIREMENTS"
      },
      {
        "type": "paragraph",
        "text": "To protect consumer privacy and prevent unauthorized access, COCO JOJO LLC may require identity verification prior to processing certain requests. Verification may include confirmation of:"
      },
      {
        "type": "listItem",
        "text": "Email address associated with your account"
      },
      {
        "type": "listItem",
        "text": "Account ownership and account credentials"
      },
      {
        "type": "listItem",
        "text": "Order history confirmation"
      },
      {
        "type": "listItem",
        "text": "Device information and authentication credentials"
      },
      {
        "type": "listItem",
        "text": "Additional commercially reasonable verification methods appropriate to the sensitivity of the request"
      },
      {
        "type": "paragraph",
        "text": "We reserve the right to deny requests where identity cannot reasonably be verified or where denial is permitted under applicable law. Verification requirements may be more stringent for requests involving sensitive personal information, deletion, or high-volume data access."
      },
      {
        "type": "paragraph",
        "text": "AUTHORIZED AGENTS"
      },
      {
        "type": "paragraph",
        "text": "Authorized agents acting on behalf of California residents may submit privacy rights requests where legally permitted. To use an authorized agent, you must provide one of the following:"
      },
      {
        "type": "listItem",
        "text": "Written authorization signed by the consumer designating the agent as their authorized representative; or"
      },
      {
        "type": "listItem",
        "text": "A valid power of attorney executed pursuant to California Probate Code Sections 4000 through 4465"
      },
      {
        "type": "paragraph",
        "text": "Authorized agent requests must be submitted to support@cocojojo.com with subject line: 'Authorized Agent Privacy Request.' We may contact the consumer directly to verify the request and confirm the agent's authorization before processing. We reserve the right to deny agent requests where adequate proof of authorization cannot be provided."
      },
      {
        "type": "paragraph",
        "text": "APPEAL & RECONSIDERATION PROCEDURE"
      },
      {
        "type": "paragraph",
        "text": "If COCO JOJO LLC denies all or part of your privacy rights request, you have the right to appeal the denial through our internal reconsideration process, as required under California CPRA regulations (11 CCR Section7104)."
      },
      {
        "type": "paragraph",
        "text": "To appeal a denied request:"
      },
      {
        "type": "listItem",
        "text": "Email support@cocojojo.com with subject line: 'Privacy Request Appeal - [Your Request Reference Number]'"
      },
      {
        "type": "listItem",
        "text": "Include your original request details, the denial reason provided, and any additional information supporting your appeal"
      },
      {
        "type": "listItem",
        "text": "We will review your appeal and provide a written response within forty-five (45) calendar days"
      },
      {
        "type": "paragraph",
        "text": "If your appeal is denied, you may escalate your complaint to the California Privacy Protection Agency (CPPA) at cppa.ca.gov or to the California Attorney General at oag.ca.gov/privacy. Filing a complaint with a regulatory authority does not affect your other legal rights."
      },
      {
        "type": "paragraph",
        "text": "NON-DISCRIMINATION"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC will not discriminate against consumers for exercising their applicable privacy rights. We will not deny goods or services, charge different prices, provide different quality of service, suggest you will receive a different level of service, or retaliate against you solely for exercising your rights under CCPA, CPRA, or other applicable privacy laws."
      },
      {
        "type": "paragraph",
        "text": "However, certain services, features, programs, promotions, or account functionality may require specific information in order to operate properly. Where providing or retaining information is necessary to complete a transaction, fulfill a service, or comply with a legal obligation, we may be unable to fulfill certain deletion or restriction requests without affecting those services."
      },
      {
        "type": "paragraph",
        "text": "REGULATORY ESCALATION & EXTERNAL COMPLAINTS"
      },
      {
        "type": "paragraph",
        "text": "If COCO JOJO LLC does not satisfactorily resolve your privacy concern, you may file a complaint with the following regulatory authorities:"
      },
      {
        "type": "paragraph",
        "text": "California Privacy Protection Agency (CPPA):"
      },
      {
        "type": "paragraph",
        "text": "Website: cppa.ca.gov | Email: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "California Attorney General - Privacy Enforcement:"
      },
      {
        "type": "paragraph",
        "text": "Website: oag.ca.gov/privacy"
      },
      {
        "type": "paragraph",
        "text": "Federal Trade Commission (FTC):"
      },
      {
        "type": "paragraph",
        "text": "Website: ftc.gov/complaint"
      },
      {
        "type": "paragraph",
        "text": "We encourage you to contact us first at support@cocojojo.com so we can address your concerns directly and promptly before involving a regulatory authority."
      },
      {
        "type": "paragraph",
        "text": "CONTACT INFORMATION"
      },
      {
        "type": "paragraph",
        "text": "Privacy Officer - COCO JOJO LLC"
      },
      {
        "type": "paragraph",
        "text": "All Privacy Requests: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "General Support: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Website: www.COCOJOJO.com"
      },
      {
        "type": "paragraph",
        "text": "Privacy Policy: www.COCOJOJO.com/privacy-policy"
      },
      {
        "type": "paragraph",
        "text": "All privacy rights requests, appeals, authorized agent requests, Do Not Sell/Share requests, data deletion requests, data portability requests, and consumer rights inquiries should be directed to support@cocojojo.com."
      },
      {
        "type": "paragraph",
        "text": "IMPORTANT NOTICE"
      },
      {
        "type": "paragraph",
        "text": "Privacy rights requests are subject to applicable legal limitations, exemptions, verification procedures, fraud prevention safeguards, cybersecurity protections, contractual obligations, dispute resolution requirements, and operational retention requirements."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC reserves all rights permitted under applicable privacy, consumer protection, commercial, cybersecurity, intellectual property, fraud prevention, and regulatory laws. Nothing in this document constitutes a waiver of any legal right, defense, exemption, or operational protection available to COCO JOJO LLC under applicable law."
      },
      {
        "type": "paragraph",
        "text": "This document is provided for informational and compliance purposes. For full terms governing your relationship with COCO JOJO LLC, refer to the COCO JOJO LLC Terms of Service (Version 5.0) and Privacy Policy (Version 2.0), both available at www.COCOJOJO.com."
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC - All Rights Reserved | Privacy Rights Page v1.0 - May 27, 2026"
      }
    ]
  },
  {
    "slug": "cookie-policy",
    "title": "Cookie Policy",
    "footerLabel": "Cookie Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "August 11, 2026",
    "summary": "How COCOJOJO uses required and optional cookies, analytics tools, advertising technologies, browser controls, and consent choices.",
    "blocks": [
      {
        "type": "table",
        "rows": [
          [
            "CALIFORNIA RESIDENTS - YOUR PRIVACY CHOICES Under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), you have the right to opt out of the sale or sharing of your personal information and to limit the use of your sensitive personal information. To exercise these rights, use any of the methods below: Webform: www.COCOJOJO.com/do-not-sell-or-share Email: support@cocojojo.com Global Privacy Control (GPC): We automatically honor GPC browser signals as a valid opt-out request for California residents."
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "This Cookie Policy (\"Policy\") explains how COCO JOJO LLC, operating the COCOJOJO brand (including, but not limited to, websites, applications, customer portals, and other digital properties bearing the COCOJOJO brand), together with its affiliates, subsidiaries, service providers, and authorized partners (collectively, \"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") use cookies, pixels, tags, scripts, software development kits (SDKs), device identifiers, local storage, session replay technologies, fingerprinting technologies, and other similar technologies (collectively, \"Tracking Technologies\") on our websites, mobile websites, applications, customer portals, advertisements, and other digital properties we control or operate (collectively, the \"Services\")."
      },
      {
        "type": "paragraph",
        "text": "This Policy is designed to comply with applicable privacy laws, including without limitation the California Consumer Privacy Act (\"CCPA\"), as amended by the California Privacy Rights Act (\"CPRA\"), and the regulations promulgated by the California Privacy Protection Agency (\"CPPA\"), as well as the General Data Protection Regulation (\"GDPR\"), the ePrivacy Directive, and other applicable U.S. state and international privacy laws."
      },
      {
        "type": "paragraph",
        "text": "Please read this Policy together with our Privacy Policy and Terms of Service. Capitalized terms not defined here have the meanings given in our Privacy Policy."
      },
      {
        "type": "paragraph",
        "text": "We use Google Consent Mode in an advanced configuration. Before you choose, and when optional storage is denied, Google tags receive denied consent signals and may send limited cookieless measurement pings that do not read or write optional advertising or analytics cookies. When you grant analytics consent, completed-purchase measurement may also be delivered from our server to Google Analytics using a random analytics identifier and order data that excludes your name, email, address, phone number, and payment credentials."
      },
      {
        "type": "paragraph",
        "text": "We create an anonymous consent receipt containing a random browser identifier, the consent-notice version, your category selections, GPC status, and the time of your choice. We use these receipts to apply your current preferences and document compliance. Withdrawing consent prevents future consent-dependent server measurement and removes optional cookies where technically possible; it does not invalidate processing completed before withdrawal."
      },
      {
        "type": "heading2",
        "text": "1. What Are Cookies and Tracking Technologies?"
      },
      {
        "type": "paragraph",
        "text": "Cookies are small text or data files placed on your browser, computer, mobile device, or other internet-connected device when you visit a website or use a digital service. \"Tracking Technologies\" is a broader term that includes cookies and similar tools, including without limitation:"
      },
      {
        "type": "listItem",
        "text": "Cookies (first-party and third-party; session and persistent)"
      },
      {
        "type": "listItem",
        "text": "Pixels, web beacons, and clear GIFs"
      },
      {
        "type": "listItem",
        "text": "Advertising tags and conversion trackers"
      },
      {
        "type": "listItem",
        "text": "Session replay, heatmap, and scroll-tracking technologies"
      },
      {
        "type": "listItem",
        "text": "Browser storage (HTML5 local storage, IndexedDB, sessionStorage)"
      },
      {
        "type": "listItem",
        "text": "Device identifiers (including IDFA, AAID, and similar)"
      },
      {
        "type": "listItem",
        "text": "Software Development Kits (SDKs) and Application Programming Interfaces (APIs)"
      },
      {
        "type": "listItem",
        "text": "Scripts and embedded third-party content"
      },
      {
        "type": "listItem",
        "text": "Device, browser, and canvas fingerprinting technologies"
      },
      {
        "type": "listItem",
        "text": "Log files, diagnostic, and debugging tools"
      },
      {
        "type": "listItem",
        "text": "Analytics, audience measurement, and attribution technologies"
      },
      {
        "type": "listItem",
        "text": "AI-assisted personalization and optimization technologies"
      },
      {
        "type": "listItem",
        "text": "Fraud-prevention and security-monitoring technologies"
      },
      {
        "type": "listItem",
        "text": "Cross-device and cross-context tracking technologies"
      },
      {
        "type": "listItem",
        "text": "Other similar or successor technologies, whether now existing or later developed"
      },
      {
        "type": "heading2",
        "text": "2. Categories of Cookies We Use"
      },
      {
        "type": "paragraph",
        "text": "We classify the Tracking Technologies we use into the following categories. The table below summarizes their purpose and typical retention period."
      },
      {
        "type": "table",
        "rows": [
          [
            "Category",
            "Purpose",
            "Examples",
            "Retention"
          ],
          [
            "Strictly Necessary",
            "Required for the Services to function (authentication, security, fraud prevention, shopping cart, load balancing). Cannot be disabled.",
            "Session ID, CSRF tokens, Cloudflare bot mitigation",
            "Session to at least 12 months"
          ],
          [
            "Functional / Preferences",
            "Remember your settings, language, region, and login state to personalize the experience.",
            "Language toggle, recently viewed products",
            "At least 13 months"
          ],
          [
            "Performance / Analytics",
            "Measure traffic, diagnose errors, and understand how visitors use the Services so we can improve them.",
            "analytics services (_ga, _gid), Cloudflare Web Analytics",
            "At least 24 months"
          ],
          [
            "Advertising / Targeting",
            "Deliver advertising relevant to you on our Services and on third-party sites, measure ad performance, and build audience segments. Constitutes \"sharing\" under CPRA.",
            "third-party advertising providers Pixel, social media platforms Pixel, third-party technology providers Ads, LinkedIn Insight",
            "At least 13 months"
          ],
          [
            "Session Replay / UX",
            "Record and analyze interactions (clicks, scrolls, form interactions) to troubleshoot issues and improve usability. Sensitive form fields are masked.",
            "Hotjar, technology service providers Clarity (or equivalent)",
            "At least 12 months"
          ],
          [
            "Email / CRM",
            "Identify subscribers, measure email engagement, and trigger automated marketing flows.",
            "email and SMS service providers, transactional email pixels",
            "At least 24 months"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "The retention periods above represent the minimum periods for which Tracking Technologies and the data they collect may be retained. Actual retention may be longer where necessary or permitted for legitimate business, security, fraud-prevention, legal, tax, accounting, or compliance purposes. We periodically review retention periods to ensure they remain appropriate for the purposes for which the data was collected."
      },
      {
        "type": "heading2",
        "text": "3. Categories of Personal Information Collected, Sold, or Shared"
      },
      {
        "type": "paragraph",
        "text": "In the preceding 12 months, we have collected, and may continue to collect, the following categories of personal information through Tracking Technologies, as defined under Cal. Civ. Code Section 1798.140. The table below identifies which categories we \"sell\" or \"share\" within the meaning of the CCPA/CPRA."
      },
      {
        "type": "table",
        "rows": [
          [
            "Category (CCPA Section 1798.140)",
            "Examples",
            "Sold?",
            "Shared?"
          ],
          [
            "Identifiers",
            "IP address, device ID, advertising ID, cookie ID, online identifiers",
            "No",
            "Yes"
          ],
          [
            "Internet/Network Activity",
            "Pages viewed, clickstream, referral URLs, search terms, interaction data",
            "No",
            "Yes"
          ],
          [
            "Geolocation (approximate)",
            "City- or region-level location inferred from IP address",
            "No",
            "Yes"
          ],
          [
            "Commercial Information",
            "Products viewed, cart contents, purchase history",
            "No",
            "Yes"
          ],
          [
            "Inferences",
            "Audience segments, inferred interests and preferences",
            "No",
            "Yes"
          ],
          [
            "Sensitive Personal Information",
            "Precise geolocation and account credentials are NOT collected via Tracking Technologies. We do not use SPI for purposes of inferring characteristics about you.",
            "No"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Note on \"Sale\" vs. \"Share\": COCOJOJO does not \"sell\" personal information for monetary consideration. The \"Yes\" entries in the \"Shared?\" column above reflect \"sharing\" within the meaning of Cal. Civ. Code Section 1798.140(ah) (i.e., disclosure for cross-context behavioral advertising). California residents may opt out of all such sharing using the methods described in Section 7. Once information is received by a third party, that third party may independently process, use, share, or sell the information in accordance with its own policies, over which COCOJOJO has no control (see Section 5)."
      },
      {
        "type": "paragraph",
        "text": "We do not knowingly sell or share the personal information of consumers under 16 years of age without affirmative authorization (opt-in consent) as required by Cal. Civ. Code Section 1798.120(c)."
      },
      {
        "type": "paragraph",
        "text": "We do not use or disclose sensitive personal information for purposes other than those specified in 11 CCR Section 7027(m)."
      },
      {
        "type": "heading2",
        "text": "4. Purposes for Which We Use Tracking Technologies"
      },
      {
        "type": "paragraph",
        "text": "We and our service providers use Tracking Technologies for the following purposes:"
      },
      {
        "type": "listItem",
        "text": "Operating, maintaining, and securing the Services"
      },
      {
        "type": "listItem",
        "text": "Authenticating users and protecting against fraud, abuse, and unauthorized access"
      },
      {
        "type": "listItem",
        "text": "Enabling shopping cart, checkout, and account functionality"
      },
      {
        "type": "listItem",
        "text": "Remembering preferences, language, and settings"
      },
      {
        "type": "listItem",
        "text": "Measuring traffic, performance, and how visitors use the Services"
      },
      {
        "type": "listItem",
        "text": "Delivering, measuring, and optimizing advertising on and off the Services"
      },
      {
        "type": "listItem",
        "text": "Engaging in cross-context behavioral advertising and retargeting"
      },
      {
        "type": "listItem",
        "text": "Building and refining audience segments and lookalike audiences"
      },
      {
        "type": "listItem",
        "text": "Measuring engagement with marketing emails and SMS"
      },
      {
        "type": "listItem",
        "text": "Diagnosing technical issues and improving the Services"
      },
      {
        "type": "listItem",
        "text": "Complying with legal obligations, enforcing our terms, and protecting our rights"
      },
      {
        "type": "paragraph",
        "text": "In addition to the purposes listed above, COCOJOJO may also use Tracking Technologies for any lawful operational, commercial, security, compliance, research, debugging, fraud-prevention, product-development, marketing-attribution, analytics, or business purpose, whether expressly enumerated herein or not."
      },
      {
        "type": "paragraph",
        "text": "Tracking Technologies may evolve over time and may include future-developed technologies not specifically described in this Policy. This Policy applies to all current, future, modified, replacement, or successor technologies that perform functions substantially similar to those described above, whether or not specifically identified herein."
      },
      {
        "type": "heading2",
        "text": "5. Third-Party Tracking Technologies"
      },
      {
        "type": "paragraph",
        "text": "We use the following categories of third-party services on our Services. These third parties may set their own Tracking Technologies and process information independently as separate businesses under the CCPA. Their use of information is governed by their own privacy policies."
      },
      {
        "type": "listItem",
        "text": "Analytics: analytics services, Cloudflare Web Analytics"
      },
      {
        "type": "listItem",
        "text": "Advertising: third-party technology providers Ads, third-party advertising providers (social media platforms/social media platforms), social media platforms, LinkedIn, YouTube"
      },
      {
        "type": "listItem",
        "text": "Email & CRM: email and SMS service providers"
      },
      {
        "type": "listItem",
        "text": "Infrastructure & Security: Cloudflare, hosting and CDN providers"
      },
      {
        "type": "listItem",
        "text": "Payment Processing: Card networks and processors (no card numbers stored by COCOJOJO)"
      },
      {
        "type": "listItem",
        "text": "E-commerce & Shipping: AfterShip, ShipStation, Shippo"
      },
      {
        "type": "listItem",
        "text": "Customer Support & UX: Customer support, session replay, and heatmap providers"
      },
      {
        "type": "table",
        "rows": [
          [
            "IMPORTANT - COCOJOJO DOES NOT SELL YOUR PERSONAL INFORMATION COCOJOJO does not sell personal information to third parties in exchange for monetary consideration. Any sharing of information referenced in this Policy is for the purposes described herein (such as analytics, advertising measurement, fraud prevention, and operating the Services) and not for the sale of personal information by COCOJOJO. The third-party platforms, services, vendors, advertising networks, and technology providers listed above (including, but not limited to, third-party technology providers, third-party advertising providers, social media platforms, LinkedIn, YouTube, email and SMS service providers, Cloudflare, and others) are independent businesses. COCOJOJO does not control how these third parties collect, use, store, share, sell, or otherwise process information once it is in their possession. Some of these third parties may, under their own policies and practices, sell, share, transfer, monetize, or otherwise use information for their own commercial purposes - including, but not limited to, cross-context behavioral advertising, audience monetization, data brokering, or resale to other parties. COCOJOJO has no ability to monitor, audit, verify, or control such activities and disclaims all responsibility and liability for them to the fullest extent permitted by law. You are solely responsible for reviewing the privacy policies, cookie policies, and terms of service of each third party before interacting with their technologies on our Services. Links to many of these third-party policies and opt-out tools are provided in Section 8."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "6. Session Replay and Heatmap Technologies"
      },
      {
        "type": "paragraph",
        "text": "We use session replay and heatmap tools to understand how visitors interact with the Services, troubleshoot issues, and improve usability. These tools may record clicks, mouse movements, scrolling, page navigation, and form interactions, but are configured to:"
      },
      {
        "type": "listItem",
        "text": "Mask passwords, payment card numbers, and other sensitive form fields by default"
      },
      {
        "type": "listItem",
        "text": "Suppress keystroke-level capture in free-text fields"
      },
      {
        "type": "listItem",
        "text": "Limit retention to the periods stated in Section 2"
      },
      {
        "type": "listItem",
        "text": "Restrict access to authorized personnel for permitted business purposes only"
      },
      {
        "type": "paragraph",
        "text": "By using the Services, you acknowledge that these technologies may be used as described above. You may opt out of session replay by emailing support@cocojojo.com or by using the methods described in Section 8."
      },
      {
        "type": "heading2",
        "text": "7. Your California Privacy Rights"
      },
      {
        "type": "paragraph",
        "text": "If you are a California resident, the CCPA, as amended by the CPRA, gives you the following rights with respect to your personal information:"
      },
      {
        "type": "listItem",
        "text": "Right to Know: Request the categories and specific pieces of personal information we have collected about you, the sources of that information, the purposes for collecting it, and the categories of third parties with whom we share it."
      },
      {
        "type": "listItem",
        "text": "Right to Delete: Request deletion of personal information we have collected about you, subject to certain exceptions."
      },
      {
        "type": "listItem",
        "text": "Right to Correct: Request that we correct inaccurate personal information we maintain about you."
      },
      {
        "type": "listItem",
        "text": "Right to Opt Out of Sale or Sharing: Direct us not to sell or share your personal information, including for cross-context behavioral advertising."
      },
      {
        "type": "listItem",
        "text": "Right to Limit Use of Sensitive Personal Information: Although we do not currently use sensitive personal information beyond the purposes permitted by 11 CCR Section 7027(m), you may still submit a request."
      },
      {
        "type": "listItem",
        "text": "Right to Non-Discrimination: We will not deny goods or services, charge different prices, or provide a different level of quality because you exercised a privacy right."
      },
      {
        "type": "listItem",
        "text": "Right to Appeal: If we deny your request, you may appeal by replying to our response or contacting support@cocojojo.com with the subject line \"Privacy Rights Appeal.\""
      },
      {
        "type": "heading3",
        "text": "How to Submit a Request"
      },
      {
        "type": "paragraph",
        "text": "You may submit a verifiable consumer request through any of the following methods. We provide at least two designated methods as required by Cal. Civ. Code Section 1798.130(a)(1):"
      },
      {
        "type": "listItem",
        "text": "Webform: www.COCOJOJO.com/privacy-request"
      },
      {
        "type": "listItem",
        "text": "\"Do Not Sell or Share\" link: www.COCOJOJO.com/do-not-sell-or-share"
      },
      {
        "type": "listItem",
        "text": "\"Limit Use of Sensitive PI\" link: www.COCOJOJO.com/limit-sensitive-info"
      },
      {
        "type": "listItem",
        "text": "Email: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "We will confirm receipt of your request within 10 business days and respond substantively within 45 calendar days, with one 45-day extension where reasonably necessary, as permitted by Cal. Civ. Code Section 1798.130(a)(2). We will take reasonable steps to verify your identity before fulfilling requests. You may also designate an authorized agent to submit requests on your behalf in accordance with 11 CCR Section 7063."
      },
      {
        "type": "heading3",
        "text": "Global Privacy Control (GPC)"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO recognizes and honors the Global Privacy Control (\"GPC\") browser signal as a valid request to opt out of the sale and sharing of personal information for California residents, in accordance with Cal. Civ. Code Section 1798.135(b) and 11 CCR Section 7025. When we detect a GPC signal from your browser, we will treat it as an opt-out for that browser and device."
      },
      {
        "type": "heading2",
        "text": "8. Managing Cookies and Opting Out"
      },
      {
        "type": "paragraph",
        "text": "You can manage Tracking Technologies in several ways:"
      },
      {
        "type": "listItem",
        "text": "Cookie Preference Center: Use the cookie-preference link on the website at any time to accept or reject analytics, advertising measurement, and personalization technologies. Choosing Essential only does not prevent access to the Services."
      },
      {
        "type": "listItem",
        "text": "Browser Controls: Most browsers let you block or delete cookies through their settings. Disabling cookies may affect site functionality."
      },
      {
        "type": "listItem",
        "text": "Mobile Device Controls: Use \"Limit Ad Tracking\" (iOS) or \"Opt out of Ads Personalization\" (Android) to limit mobile advertising IDs."
      },
      {
        "type": "listItem",
        "text": "Industry Opt-Outs: Digital Advertising Alliance (optout.aboutads.info), Network Advertising Initiative (optout.networkadvertising.org), and European Interactive Digital Advertising Alliance (youronlinechoices.eu)."
      },
      {
        "type": "listItem",
        "text": "Platform Settings: third-party technology providers Ad Settings (adssettings.third-party technology providers.com), third-party advertising providers Ad Preferences, social media platforms Privacy Settings, LinkedIn Ad Settings."
      },
      {
        "type": "listItem",
        "text": "analytics services Opt-Out: tools.third-party technology providers.com/dlpage/gaoptout"
      },
      {
        "type": "heading2",
        "text": "9. Do Not Track Signals"
      },
      {
        "type": "paragraph",
        "text": "Because there is no consistent industry standard for \"Do Not Track\" (\"DNT\") browser signals, the Services do not respond to DNT signals at this time. However, as described in Section 7, we do honor Global Privacy Control (GPC) signals for California residents."
      },
      {
        "type": "heading2",
        "text": "10. Children's Privacy"
      },
      {
        "type": "paragraph",
        "text": "The Services are not directed to children under 13, and we do not knowingly collect personal information from children under 13 in violation of the Children's Online Privacy Protection Act (\"COPPA\"). For consumers between 13 and 16, we will not sell or share personal information without affirmative opt-in consent."
      },
      {
        "type": "heading2",
        "text": "11. International Users and Data Transfers"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO operates in the United States. If you access the Services from outside the United States, you understand that information collected through Tracking Technologies may be transferred to, stored in, and processed in the United States or other jurisdictions whose data protection laws may differ from those of your country."
      },
      {
        "type": "paragraph",
        "text": "Where required by GDPR or other applicable laws, we rely on appropriate safeguards (including Standard Contractual Clauses) for cross-border data transfers."
      },
      {
        "type": "heading3",
        "text": "Prior Consent for EEA, UK, and Swiss Users"
      },
      {
        "type": "paragraph",
        "text": "For users located in jurisdictions requiring prior consent for non-essential cookies and tracking technologies - including the European Economic Area (EEA), the United Kingdom, and Switzerland - optional storage remains denied unless the user grants the relevant category through the cookie-preference tool. Users can reject all optional categories and continue using the Services, and can withdraw a prior choice through the same tool at any time."
      },
      {
        "type": "paragraph",
        "text": "Strictly necessary cookies required for the operation of the Services do not require consent and may be set on a service-essential basis. COCOJOJO is a United States-based business with its primary operations in California; users accessing the Services from outside the United States do so on their own initiative and are responsible for compliance with the laws of their own jurisdictions."
      },
      {
        "type": "heading2",
        "text": "12. Data Retention"
      },
      {
        "type": "paragraph",
        "text": "We retain information collected through Tracking Technologies for at least the periods specified in Section 2 (Categories of Cookies We Use), and may retain such information for longer periods where necessary or permitted for legitimate business, security, fraud-prevention, legal, tax, accounting, or compliance purposes (including, without limitation, legal holds and records-retention obligations). When data is no longer needed for any such purpose, we delete, anonymize, or aggregate it in accordance with our records-retention practices."
      },
      {
        "type": "heading2",
        "text": "13. Security"
      },
      {
        "type": "paragraph",
        "text": "We maintain reasonable administrative, technical, and physical safeguards designed to protect personal information against unauthorized access, disclosure, alteration, and destruction. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security."
      },
      {
        "type": "heading2",
        "text": "14. Changes to This Cookie Policy"
      },
      {
        "type": "paragraph",
        "text": "We may update this Policy from time to time to reflect changes in our practices, technology, or applicable law. When we make material changes, we will update the \"Last Updated\" date at the top of this Policy and, where required by law, provide additional notice (such as a banner on the Services or a direct communication). We encourage you to review this Policy periodically."
      },
      {
        "type": "heading2",
        "text": "15. No Guarantee Regarding Third-Party Technologies"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO does not guarantee, represent, or warrant that third-party Tracking Technologies, consent management platforms, cookie banners, opt-out mechanisms, browser controls, privacy preference signals (including Global Privacy Control), industry opt-out tools, or any other privacy-related technologies will operate error-free, uninterrupted, continuously, completely secure, or effective in all browsers, devices, operating systems, network environments, or jurisdictions."
      },
      {
        "type": "paragraph",
        "text": "Users acknowledge and agree that internet, browser, operating system, device, network, and third-party platform limitations - as well as user-side configurations, extensions, ad blockers, VPNs, and similar tools - may impact the availability, accuracy, transmission, recognition, or effectiveness of cookies, consent choices, opt-out preferences, and other privacy controls. COCOJOJO disclaims all liability arising from such limitations to the fullest extent permitted by applicable law."
      },
      {
        "type": "paragraph",
        "text": "Nothing in this Section limits any non-waivable rights you may have under applicable law, including the CCPA/CPRA, GDPR, UK GDPR, or other consumer protection or privacy statutes."
      },
      {
        "type": "heading2",
        "text": "16. Dispute Resolution and Incorporation of Terms"
      },
      {
        "type": "paragraph",
        "text": "Any disputes, claims, or controversies arising out of or relating to this Cookie Policy, the Services, or the use of Tracking Technologies shall be governed by, and resolved in accordance with, the dispute-resolution provisions, mandatory arbitration clauses, class-action and collective-action waivers, jury-trial waivers, limitations of liability, indemnification provisions, governing-law provisions, and forum-selection clauses contained in our Terms of Service, which are incorporated herein by reference in their entirety and made a part of this Cookie Policy."
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by applicable law, by accessing or using the Services, you agree to be bound by such provisions. If any term of this Cookie Policy conflicts with the Terms of Service, the Terms of Service shall control with respect to dispute resolution, arbitration, waivers, and limitations of liability, except where applicable law (including the CCPA/CPRA, GDPR, or UK GDPR) provides otherwise or grants you non-waivable rights."
      },
      {
        "type": "heading2",
        "text": "17. Contact Information"
      },
      {
        "type": "paragraph",
        "text": "If you have questions about this Cookie Policy or our privacy practices, please contact our Privacy Officer:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Privacy Officer",
            "support@cocojojo.com"
          ],
          [
            "General Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "do-not-sell-or-share",
    "title": "Do Not Sell or Share My Personal Information",
    "footerLabel": "Do Not Sell or Share My Personal Information",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "How California residents can exercise opt-out rights related to sale, sharing, targeted advertising, and sensitive personal information.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Under the California Consumer Privacy Act (\"CCPA\"), as amended by the California Privacy Rights Act (\"CPRA\"), California residents have the right to direct businesses not to \"sell\" or \"share\" their personal information, as those terms are defined under California law."
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") values your privacy and provides California residents with the ability to opt out of the sale or sharing of personal information used for cross-context behavioral advertising, targeted advertising, analytics, audience measurement, retargeting, advertising attribution, marketing optimization, and similar activities."
      },
      {
        "type": "heading2",
        "text": "What Does \"Sell\" or \"Share\" Mean?"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO does not sell personal information in exchange for monetary compensation."
      },
      {
        "type": "paragraph",
        "text": "However, certain uses of cookies, pixels, analytics tools, advertising technologies, and similar Tracking Technologies may constitute \"sharing\" under the CPRA when information is disclosed to third parties for cross-context behavioral advertising purposes."
      },
      {
        "type": "paragraph",
        "text": "This may include disclosures involving technologies provided by third parties such as:"
      },
      {
        "type": "listItem",
        "text": "third-party technology providers"
      },
      {
        "type": "listItem",
        "text": "third-party advertising providers (social media platforms and social media platforms)"
      },
      {
        "type": "listItem",
        "text": "social media platforms"
      },
      {
        "type": "listItem",
        "text": "LinkedIn"
      },
      {
        "type": "listItem",
        "text": "YouTube"
      },
      {
        "type": "listItem",
        "text": "email and SMS service providers"
      },
      {
        "type": "listItem",
        "text": "Analytics providers"
      },
      {
        "type": "listItem",
        "text": "Advertising platforms"
      },
      {
        "type": "listItem",
        "text": "Marketing and attribution vendors"
      },
      {
        "type": "listItem",
        "text": "Session replay and audience measurement providers"
      },
      {
        "type": "listItem",
        "text": "Other advertising and technology partners"
      },
      {
        "type": "paragraph",
        "text": "These technologies may collect or receive information such as:"
      },
      {
        "type": "listItem",
        "text": "IP address"
      },
      {
        "type": "listItem",
        "text": "Device identifiers"
      },
      {
        "type": "listItem",
        "text": "Cookie identifiers"
      },
      {
        "type": "listItem",
        "text": "Browsing activity"
      },
      {
        "type": "listItem",
        "text": "Shopping activity"
      },
      {
        "type": "listItem",
        "text": "Pages viewed"
      },
      {
        "type": "listItem",
        "text": "Referring URLs"
      },
      {
        "type": "listItem",
        "text": "Interaction data"
      },
      {
        "type": "listItem",
        "text": "Advertising identifiers"
      },
      {
        "type": "listItem",
        "text": "Approximate geolocation"
      },
      {
        "type": "listItem",
        "text": "Inferred interests and audience segments"
      },
      {
        "type": "heading2",
        "text": "Your Right to Opt Out"
      },
      {
        "type": "paragraph",
        "text": "You have the right to direct COCOJOJO not to sell or share your personal information for purposes of cross-context behavioral advertising."
      },
      {
        "type": "paragraph",
        "text": "Once we receive and verify your request, we will apply your opt-out preference within fifteen (15) business days, as required by 11 CCR Section 7026(f), and will notify third parties to whom we shared your personal information within the preceding ninety (90) days."
      },
      {
        "type": "paragraph",
        "text": "Your opt-out request may apply to:"
      },
      {
        "type": "listItem",
        "text": "The browser and device used to submit the request"
      },
      {
        "type": "listItem",
        "text": "The identifiers reasonably associated with your request"
      },
      {
        "type": "listItem",
        "text": "Where you provide an email address or other persistent identifier, the preferences linked to that identifier across our Services, to the extent technically feasible"
      },
      {
        "type": "listItem",
        "text": "Tracking Technologies subject to applicable law"
      },
      {
        "type": "paragraph",
        "text": "You may need to renew your preferences if you clear cookies, change browsers, use a different device, reset browser settings, or use privacy or ad-blocking tools that interfere with preference storage."
      },
      {
        "type": "heading2",
        "text": "How to Submit an Opt-Out Request"
      },
      {
        "type": "paragraph",
        "text": "We provide multiple designated methods for submitting opt-out requests, in accordance with Cal. Civ. Code Section 1798.130(a)(1):"
      },
      {
        "type": "heading3",
        "text": "1. Email Request"
      },
      {
        "type": "paragraph",
        "text": "Email: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Please include the following in your email:"
      },
      {
        "type": "listItem",
        "text": "Your full name"
      },
      {
        "type": "listItem",
        "text": "Email address"
      },
      {
        "type": "listItem",
        "text": "The words \"Do Not Sell or Share\" in the subject line"
      },
      {
        "type": "listItem",
        "text": "The browser and device you use when accessing our Services"
      },
      {
        "type": "heading3",
        "text": "2. Mail Request"
      },
      {
        "type": "paragraph",
        "text": "You may also submit your opt-out request by mail to:"
      },
      {
        "type": "paragraph",
        "text": "Please include your full name, email address, and a clear statement that you are requesting to opt out of the sale and sharing of your personal information under the CCPA/CPRA."
      },
      {
        "type": "heading3",
        "text": "3. Global Privacy Control (GPC)"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO recognizes and honors browser-based Global Privacy Control (\"GPC\") signals as a valid request to opt out of the sale and sharing of personal information for California residents, in accordance with Cal. Civ. Code Section 1798.135(b) and 11 CCR Section 7025."
      },
      {
        "type": "paragraph",
        "text": "If your browser sends a recognized GPC signal, we will process it as an opt-out request for that browser and device automatically, without requiring any further action on your part."
      },
      {
        "type": "heading2",
        "text": "Response Timeline"
      },
      {
        "type": "paragraph",
        "text": "In accordance with Cal. Civ. Code Section 1798.130(a)(2):"
      },
      {
        "type": "listItem",
        "text": "Acknowledgment: We will confirm receipt of your request within ten (10) business days."
      },
      {
        "type": "listItem",
        "text": "Opt-Out Processing: We will apply your opt-out preference within fifteen (15) business days of receipt, as required by 11 CCR Section 7026(f)."
      },
      {
        "type": "listItem",
        "text": "Substantive Response: We will respond substantively to your request within forty-five (45) calendar days, with one additional 45-day extension where reasonably necessary and with prior notice to you."
      },
      {
        "type": "heading2",
        "text": "Authorized Agents"
      },
      {
        "type": "paragraph",
        "text": "California residents may designate an authorized agent to submit requests on their behalf, in accordance with 11 CCR Section 7063. We may require:"
      },
      {
        "type": "listItem",
        "text": "Written, signed permission from you authorizing the agent to act on your behalf"
      },
      {
        "type": "listItem",
        "text": "Verification of your identity directly with us"
      },
      {
        "type": "listItem",
        "text": "Confirmation that you provided the agent with such permission"
      },
      {
        "type": "paragraph",
        "text": "These verification requirements do not apply where the agent has been provided with a valid power of attorney pursuant to Cal. Prob. Code SectionSection 4000-4465."
      },
      {
        "type": "heading2",
        "text": "Non-Discrimination"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO will not discriminate against you for exercising any privacy rights under applicable law, as required by Cal. Civ. Code Section 1798.125. Unless permitted by law, we will not:"
      },
      {
        "type": "listItem",
        "text": "Deny goods or services"
      },
      {
        "type": "listItem",
        "text": "Charge different prices or rates for goods or services, including through the use of discounts, benefits, or other penalties"
      },
      {
        "type": "listItem",
        "text": "Provide a different level or quality of goods or services"
      },
      {
        "type": "listItem",
        "text": "Suggest that you will receive a different price, rate, level, or quality of goods or services"
      },
      {
        "type": "listItem",
        "text": "Retaliate against you as an employee, applicant, or contractor for exercising your rights"
      },
      {
        "type": "heading2",
        "text": "Additional Privacy Rights"
      },
      {
        "type": "paragraph",
        "text": "In addition to the right to opt out of the sale or sharing of your personal information, California residents have the following rights:"
      },
      {
        "type": "listItem",
        "text": "Right to Know: Request the categories and specific pieces of personal information we have collected, the sources of that information, the purposes for collecting it, and the categories of third parties with whom we share it."
      },
      {
        "type": "listItem",
        "text": "Right to Delete: Request deletion of personal information we have collected, subject to certain exceptions."
      },
      {
        "type": "listItem",
        "text": "Right to Correct: Request that we correct inaccurate personal information we maintain about you."
      },
      {
        "type": "listItem",
        "text": "Right to Limit Use of Sensitive Personal Information: Direct us to limit the use and disclosure of sensitive personal information."
      },
      {
        "type": "listItem",
        "text": "Right to Appeal: If we deny your request, you may appeal by replying to our response or emailing support@cocojojo.com with the subject line \"Privacy Rights Appeal.\""
      },
      {
        "type": "paragraph",
        "text": "Please review our Privacy Policy and Cookie Policy for additional information regarding our privacy practices."
      },
      {
        "type": "heading2",
        "text": "Important Notice Regarding Third Parties"
      },
      {
        "type": "paragraph",
        "text": "Third-party platforms, advertising networks, analytics providers, and technology vendors may independently collect, use, process, share, transfer, monetize, or otherwise handle information according to their own policies and practices."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO does not control the privacy practices of third parties once information is transmitted to or collected by those parties through their technologies. Some third parties may, under their own policies, sell, share, transfer, monetize, or otherwise use information for their own commercial purposes - including, but not limited to, cross-context behavioral advertising, audience monetization, data brokering, or resale to other parties. COCOJOJO has no ability to monitor, audit, verify, or control such activities and disclaims all responsibility and liability for them to the fullest extent permitted by law."
      },
      {
        "type": "paragraph",
        "text": "Users are solely responsible for reviewing the privacy policies, cookie policies, and terms of service of each third-party service they interact with on our Services."
      },
      {
        "type": "heading2",
        "text": "Contact Information"
      },
      {
        "type": "paragraph",
        "text": "If you have questions about this notice or our privacy practices, please contact us:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Privacy Officer",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "refund-policy",
    "title": "Refund Policy",
    "footerLabel": "Refund Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "This Refund Policy explains return eligibility, return instructions, restocking fees, nonreturnable items, cancellation limits, and international order limitations for COCOJOJO purchases.",
    "blocks": [
      {
        "type": "heading2",
        "text": "Return Instructions"
      },
      {
        "type": "paragraph",
        "text": "If you are dissatisfied with your order for any reason, contact COCOJOJO within 30 days at support@cocojojo.com. If we cannot resolve the issue, we may provide return instructions and a return authorization. COCOJOJO does not provide free return shipping labels unless expressly stated in writing."
      },
      {
        "type": "listItem",
        "text": "Products must be unused and returned in their original packaging."
      },
      {
        "type": "listItem",
        "text": "Returns must be postmarked within the applicable return period shown on your invoice or return authorization."
      },
      {
        "type": "listItem",
        "text": "All pieces, kits, accessories, and free gifts included with the order must be returned to receive any eligible refund."
      },
      {
        "type": "listItem",
        "text": "Include your full name, order number, and return authorization details in the package."
      },
      {
        "type": "listItem",
        "text": "Shipping fees are not refundable unless required by law or approved by COCOJOJO in writing."
      },
      {
        "type": "heading2",
        "text": "Order Changes and Cancellation"
      },
      {
        "type": "paragraph",
        "text": "Because COCOJOJO processes orders quickly, confirmed orders may not be cancelable or modifiable. COCOJOJO reserves the right to cancel any order at its sole discretion and refund amounts paid where applicable."
      },
      {
        "type": "heading2",
        "text": "Nonreturnable Items"
      },
      {
        "type": "listItem",
        "text": "Items that are used, damaged, altered, or abused."
      },
      {
        "type": "listItem",
        "text": "Items that are missing parts, packaging, labels, or included materials."
      },
      {
        "type": "listItem",
        "text": "Non-defective special orders, custom orders, private label orders, and other made-to-order products unless otherwise required by law."
      },
      {
        "type": "heading2",
        "text": "Restocking Fee"
      },
      {
        "type": "paragraph",
        "text": "Returned items may be subject to a restocking fee of up to 15% of the total amount. Any applicable restocking fee will be deducted from the refund before issuance."
      },
      {
        "type": "heading2",
        "text": "International Orders"
      },
      {
        "type": "paragraph",
        "text": "International customers are responsible for confirming that products, documentation, and import requirements meet the laws of their destination country before ordering. COCOJOJO is not responsible for customs fees, brokerage fees, customs release charges, import delays, refusal, seizure, or destruction of goods by customs authorities."
      },
      {
        "type": "heading2",
        "text": "Need Help?"
      },
      {
        "type": "paragraph",
        "text": "For return or refund questions, contact support@cocojojo.com and include your order number."
      }
    ]
  },
  {
    "slug": "shipping-policy",
    "title": "Shipping Policy",
    "footerLabel": "Shipping Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "This Shipping Policy explains order processing, delivery estimates, shipping costs, tracking, international shipping, and lost or stolen package procedures for COCOJOJO orders.",
    "blocks": [
      {
        "type": "heading2",
        "text": "Signature Confirmation"
      },
      {
        "type": "paragraph",
        "text": "If you need signature confirmation, include a note when placing your order. Signature confirmation may be added upon request. On orders of $600 or more, signature confirmation may be applied automatically."
      },
      {
        "type": "heading2",
        "text": "Order Processing"
      },
      {
        "type": "paragraph",
        "text": "Orders are handled and shipped from COCOJOJO fulfillment operations in the United States. Please allow extra processing time during holidays, high-volume periods, and promotional events."
      },
      {
        "type": "paragraph",
        "text": "Please allow 2-4 business days for order processing. Once your order has been processed, you will receive a confirmation email with tracking information when available."
      },
      {
        "type": "heading2",
        "text": "Estimated Delivery Time"
      },
      {
        "type": "table",
        "rows": [
          [
            "Handling time",
            "2-4 business days, Monday-Friday"
          ],
          [
            "Transit time",
            "7-14 business days, Monday-Friday"
          ],
          [
            "Order cut-off time",
            "5:00 PM Eastern Time"
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "Shipping Cost"
      },
      {
        "type": "paragraph",
        "text": "Retail orders may qualify for free shipping across the continental United States when the applicable free-shipping threshold is met. Some products, destinations, order types, and shipping methods may be excluded."
      },
      {
        "type": "heading2",
        "text": "Method of Delivery"
      },
      {
        "type": "paragraph",
        "text": "Orders may be shipped using postal, parcel, freight, or other carriers selected by COCOJOJO. Delivery confirmation from the carrier is treated as evidence of delivery to the address provided with the order."
      },
      {
        "type": "heading2",
        "text": "Order Tracking"
      },
      {
        "type": "paragraph",
        "text": "When you place an order with COCOJOJO, you will receive an order confirmation by email. If you have questions about your order, contact support@cocojojo.com and include your order number."
      },
      {
        "type": "heading2",
        "text": "International Shipping"
      },
      {
        "type": "paragraph",
        "text": "For large-quantity international orders, contact COCOJOJO to request a customized shipping quote. International customers are responsible for customs duties, import taxes, brokerage fees, destination-country compliance, and any import restrictions."
      },
      {
        "type": "heading2",
        "text": "Lost or Stolen Packages"
      },
      {
        "type": "paragraph",
        "text": "If your package is lost or stolen after being marked delivered, contact the carrier directly to file a claim. COCOJOJO will assist where reasonably possible but is not responsible for packages after carrier-confirmed delivery except as required by law."
      },
      {
        "type": "heading2",
        "text": "Shipping Address Changes"
      },
      {
        "type": "paragraph",
        "text": "After an order has shipped, the destination country or shipping address may not be changed."
      },
      {
        "type": "heading2",
        "text": "Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO works with carriers to support timely delivery, but delays may occur due to carrier issues, weather, customs, holidays, high-volume periods, or other circumstances outside COCOJOJO control."
      }
    ]
  },
  {
    "slug": "disclaimer",
    "title": "Disclaimer",
    "footerLabel": "Disclaimer",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Important legal disclaimers about COCOJOJO website content, product information, cosmetic statements, third-party services, and limitation of liability.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "The information, content, product descriptions, statements, graphics, images, recommendations, formulations, ingredients, specifications, documentation, marketing materials, educational materials, and other materials available through COCO JOJO LLC, including the COCOJOJO brand and all affiliated websites, digital platforms, social media channels, communications, packaging, labels, catalogs, advertisements, and services (collectively, the \"Services\") are provided for general informational, educational, research, and commercial purposes only."
      },
      {
        "type": "paragraph",
        "text": "By accessing or using the Services or purchasing any products from COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\"), you acknowledge and agree to the disclaimers, limitations, warnings, and terms set forth herein."
      },
      {
        "type": "paragraph",
        "text": "Statements made regarding cosmetic, skincare, haircare, wellness, aromatherapy, personal care, herbal, botanical, peptide, oil, extract, or other products offered by COCOJOJO have not necessarily been evaluated by the United States Food and Drug Administration (\"FDA\") unless expressly stated otherwise."
      },
      {
        "type": "paragraph",
        "text": "Except where explicitly identified as an FDA-regulated over-the-counter (\"OTC\") drug product, COCOJOJO products are intended solely for cosmetic, beauty, cleansing, moisturizing, personal care, aromatherapy, or general wellness purposes."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO cosmetic products are not intended to diagnose, treat, cure, mitigate, or prevent any disease, medical condition, or health disorder."
      },
      {
        "type": "paragraph",
        "text": "Nothing contained on the Services or in any COCOJOJO materials shall be construed as medical claims, drug claims, therapeutic guarantees, or representations of clinical efficacy unless expressly required and permitted by applicable law."
      },
      {
        "type": "heading2",
        "text": "California Proposition 65 Notice"
      },
      {
        "type": "paragraph",
        "text": "Pursuant to the California Safe Drinking Water and Toxic Enforcement Act of 1986 (commonly known as \"Proposition 65\" or \"Prop 65\"), California law requires businesses to provide warnings to California consumers about exposure to chemicals known to the State of California to cause cancer, birth defects, or other reproductive harm."
      },
      {
        "type": "table",
        "rows": [
          [
            "WARNING Certain COCOJOJO products may contain chemicals known to the State of California to cause cancer, birth defects, or other reproductive harm. For more information, visit www.P65Warnings.ca.gov. Where applicable, product-specific Proposition 65 warnings are provided on product packaging, product detail pages, or accompanying documentation."
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Naturally occurring trace amounts of chemicals listed under Proposition 65 may be present in certain botanical, mineral, clay, or plant-derived ingredients, even where such ingredients are organic, natural, or otherwise certified. COCOJOJO provides this general warning out of an abundance of caution and to ensure compliance with California law."
      },
      {
        "type": "heading2",
        "text": "California Safe Cosmetics Act Compliance"
      },
      {
        "type": "paragraph",
        "text": "Where required, COCOJOJO complies with the California Safe Cosmetics Act of 2005 (Cal. Health & Safety Code SectionSection 111791-111793.5) and reports applicable ingredient information to the California Department of Public Health Safe Cosmetics Program (\"CSCP\"). California residents may access additional ingredient information through the CSCP database at www.cdph.ca.gov/safecosmetics."
      },
      {
        "type": "heading2",
        "text": "No Medical Advice"
      },
      {
        "type": "paragraph",
        "text": "The Services do not provide medical advice, dermatological advice, pharmaceutical advice, healthcare advice, diagnosis, treatment recommendations, or professional medical services."
      },
      {
        "type": "paragraph",
        "text": "Information provided by COCOJOJO, including product descriptions, educational materials, ingredient discussions, blog content, emails, customer service communications, or marketing materials, is not a substitute for advice from qualified healthcare professionals."
      },
      {
        "type": "paragraph",
        "text": "Always seek the advice of a licensed physician, dermatologist, pharmacist, allergist, or other qualified healthcare provider regarding any medical condition, allergy, skin sensitivity, medication interaction, pregnancy-related concern, or health issue."
      },
      {
        "type": "paragraph",
        "text": "Never disregard professional medical advice or delay seeking treatment because of information obtained from COCOJOJO."
      },
      {
        "type": "heading2",
        "text": "No Professional Relationship"
      },
      {
        "type": "paragraph",
        "text": "Nothing in the Services, in any communication with COCOJOJO, or in any content, catalog, technical document, specification sheet, safety data sheet, formulation guide, ingredient description, educational material, blog post, video, or marketing material creates or shall be construed to create any:"
      },
      {
        "type": "listItem",
        "text": "Doctor-patient relationship"
      },
      {
        "type": "listItem",
        "text": "Dermatologist-patient relationship"
      },
      {
        "type": "listItem",
        "text": "Pharmacist-patient relationship"
      },
      {
        "type": "listItem",
        "text": "Esthetician-client relationship"
      },
      {
        "type": "listItem",
        "text": "Cosmetic chemist-client relationship"
      },
      {
        "type": "listItem",
        "text": "Formulator-client relationship"
      },
      {
        "type": "listItem",
        "text": "Regulatory consultant-client relationship"
      },
      {
        "type": "listItem",
        "text": "Attorney-client relationship"
      },
      {
        "type": "listItem",
        "text": "Fiduciary or other professional relationship"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO is a cosmetics and ingredients supplier. Any educational, technical, or informational content provided through the Services is general in nature and is not tailored to your specific circumstances, formulation, intended use, or jurisdiction. You are solely responsible for obtaining professional advice appropriate to your situation."
      },
      {
        "type": "heading2",
        "text": "No Guaranteed Results"
      },
      {
        "type": "paragraph",
        "text": "Individual results from cosmetic, skincare, haircare, wellness, aromatherapy, peptide, botanical, oil, extract, and personal care products vary significantly from person to person."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO makes no guarantees, representations, warranties, or assurances regarding:"
      },
      {
        "type": "listItem",
        "text": "Product effectiveness"
      },
      {
        "type": "listItem",
        "text": "Cosmetic outcomes"
      },
      {
        "type": "listItem",
        "text": "Skin compatibility"
      },
      {
        "type": "listItem",
        "text": "Hair growth"
      },
      {
        "type": "listItem",
        "text": "Anti-aging effects"
      },
      {
        "type": "listItem",
        "text": "Acne improvement"
      },
      {
        "type": "listItem",
        "text": "Wrinkle reduction"
      },
      {
        "type": "listItem",
        "text": "Pigmentation correction"
      },
      {
        "type": "listItem",
        "text": "Lash or brow enhancement"
      },
      {
        "type": "listItem",
        "text": "Body contouring"
      },
      {
        "type": "listItem",
        "text": "Wellness benefits"
      },
      {
        "type": "listItem",
        "text": "Sensory experiences"
      },
      {
        "type": "listItem",
        "text": "User satisfaction"
      },
      {
        "type": "listItem",
        "text": "Product performance"
      },
      {
        "type": "listItem",
        "text": "Clinical outcomes"
      },
      {
        "type": "listItem",
        "text": "Commercial success"
      },
      {
        "type": "listItem",
        "text": "Regulatory acceptance"
      },
      {
        "type": "listItem",
        "text": "Consumer acceptance"
      },
      {
        "type": "paragraph",
        "text": "Any testimonials, reviews, before-and-after photos, social media content, case studies, influencer statements, demonstrations, examples, or marketing materials represent individual experiences only and do not guarantee that any user will achieve the same or similar results."
      },
      {
        "type": "heading2",
        "text": "Patch Test Recommendation"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO strongly recommends performing a patch test before using any cosmetic, skincare, haircare, peptide, essential oil, botanical, fragrance, extract, preservative, surfactant, or personal care product."
      },
      {
        "type": "paragraph",
        "text": "Patch testing should be performed prior to full application, especially for:"
      },
      {
        "type": "listItem",
        "text": "Sensitive skin"
      },
      {
        "type": "listItem",
        "text": "Allergy-prone individuals"
      },
      {
        "type": "listItem",
        "text": "New products"
      },
      {
        "type": "listItem",
        "text": "Essential oils"
      },
      {
        "type": "listItem",
        "text": "Active ingredients"
      },
      {
        "type": "listItem",
        "text": "Peptides"
      },
      {
        "type": "listItem",
        "text": "Acids"
      },
      {
        "type": "listItem",
        "text": "Fragrances"
      },
      {
        "type": "listItem",
        "text": "Botanical extracts"
      },
      {
        "type": "listItem",
        "text": "Retinoids"
      },
      {
        "type": "listItem",
        "text": "Exfoliants"
      },
      {
        "type": "listItem",
        "text": "Products used around the eyes, lips, scalp, or intimate areas"
      },
      {
        "type": "paragraph",
        "text": "Discontinue use immediately if redness, irritation, burning, swelling, itching, rash, discomfort, allergic reaction, or any adverse reaction occurs."
      },
      {
        "type": "heading2",
        "text": "Allergy and Sensitivity Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO products may contain natural and synthetic ingredients capable of causing irritation, sensitivities, allergic reactions, or adverse effects in certain individuals."
      },
      {
        "type": "paragraph",
        "text": "Natural ingredients, botanical extracts, essential oils, fragrances, peptides, proteins, nut oils, seed oils, plant derivatives, preservatives, colorants, surfactants, and active ingredients may trigger allergic reactions or sensitivities, even where products are labeled as natural, organic, clean, gentle, hypoallergenic, or fragrance-free."
      },
      {
        "type": "paragraph",
        "text": "Users are solely responsible for reviewing ingredient lists and determining whether products are appropriate for their personal use."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO disclaims all liability for allergic reactions, irritations, sensitivities, misuse, interactions, or adverse events to the fullest extent permitted by law."
      },
      {
        "type": "heading2",
        "text": "Pregnancy, Nursing, and Pediatric Use"
      },
      {
        "type": "paragraph",
        "text": "Certain ingredients in cosmetic, skincare, aromatherapy, essential oil, peptide, herbal, and botanical products - including, without limitation, essential oils, retinoids, salicylic acid, hydroquinone, certain herbal extracts, and certain active ingredients - may not be appropriate for use by pregnant individuals, nursing individuals, infants, children, or persons with certain medical conditions."
      },
      {
        "type": "paragraph",
        "text": "Essential oils are highly concentrated and may pose particular risks to pregnant and nursing individuals, infants, children, elderly individuals, and individuals with epilepsy, asthma, hypertension, or other medical conditions. Many essential oils should not be applied undiluted to the skin and should never be ingested."
      },
      {
        "type": "paragraph",
        "text": "Consult a qualified healthcare provider before using any COCOJOJO product if you are pregnant, attempting to become pregnant, nursing, caring for an infant or child, elderly, or managing a medical condition. Keep all products out of reach of children and pets."
      },
      {
        "type": "heading2",
        "text": "Professional Consultation Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "Consumers, formulators, brands, manufacturers, resellers, estheticians, salons, spas, healthcare providers, and commercial purchasers should consult appropriate professionals before using, reselling, reformulating, manufacturing, marketing, labeling, or distributing products purchased from COCOJOJO."
      },
      {
        "type": "paragraph",
        "text": "This includes, without limitation:"
      },
      {
        "type": "listItem",
        "text": "Physicians"
      },
      {
        "type": "listItem",
        "text": "Dermatologists"
      },
      {
        "type": "listItem",
        "text": "Pharmacists"
      },
      {
        "type": "listItem",
        "text": "Toxicologists"
      },
      {
        "type": "listItem",
        "text": "Cosmetic chemists"
      },
      {
        "type": "listItem",
        "text": "Regulatory consultants"
      },
      {
        "type": "listItem",
        "text": "Legal counsel"
      },
      {
        "type": "listItem",
        "text": "Compliance professionals"
      },
      {
        "type": "listItem",
        "text": "Insurance providers"
      },
      {
        "type": "listItem",
        "text": "Testing laboratories"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO does not guarantee that products, ingredients, formulations, labels, claims, packaging, or documentation comply with the laws or regulations of every jurisdiction, country, state, retailer, marketplace, or regulatory authority."
      },
      {
        "type": "heading2",
        "text": "Ingredient Variability Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "Due to the natural, agricultural, botanical, mineral, seasonal, regional, supplier-based, manufacturing, harvesting, processing, and formulation-related characteristics of cosmetic and natural products, variations may occur between lots, batches, crops, shipments, or production runs."
      },
      {
        "type": "paragraph",
        "text": "Such variations may include, without limitation:"
      },
      {
        "type": "listItem",
        "text": "Color differences"
      },
      {
        "type": "listItem",
        "text": "Scent or aroma differences"
      },
      {
        "type": "listItem",
        "text": "Texture differences"
      },
      {
        "type": "listItem",
        "text": "Viscosity changes"
      },
      {
        "type": "listItem",
        "text": "Sedimentation"
      },
      {
        "type": "listItem",
        "text": "Crystallization"
      },
      {
        "type": "listItem",
        "text": "Cloudiness"
      },
      {
        "type": "listItem",
        "text": "Separation"
      },
      {
        "type": "listItem",
        "text": "Botanical inconsistencies"
      },
      {
        "type": "listItem",
        "text": "Natural particulate matter"
      },
      {
        "type": "listItem",
        "text": "Seasonal variations"
      },
      {
        "type": "listItem",
        "text": "Oxidation changes"
      },
      {
        "type": "listItem",
        "text": "Batch-to-batch variations"
      },
      {
        "type": "listItem",
        "text": "Ingredient-origin differences"
      },
      {
        "type": "paragraph",
        "text": "These variations are normal and do not necessarily indicate defects, contamination, adulteration, or product failure."
      },
      {
        "type": "heading2",
        "text": "Color and Fragrance Variation Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "Many COCOJOJO products contain naturally derived ingredients, botanical materials, essential oils, herbs, clays, butters, extracts, pigments, and fragrances. As a result:"
      },
      {
        "type": "listItem",
        "text": "Product color may vary"
      },
      {
        "type": "listItem",
        "text": "Fragrance intensity may vary"
      },
      {
        "type": "listItem",
        "text": "Texture and appearance may vary"
      },
      {
        "type": "listItem",
        "text": "Natural settling or separation may occur"
      },
      {
        "type": "listItem",
        "text": "Products may darken or lighten over time"
      },
      {
        "type": "listItem",
        "text": "Raw material characteristics may change between lots"
      },
      {
        "type": "paragraph",
        "text": "Such variations are considered normal characteristics of cosmetic and natural products."
      },
      {
        "type": "heading2",
        "text": "External Use Only"
      },
      {
        "type": "paragraph",
        "text": "Unless expressly stated otherwise, COCOJOJO cosmetic and personal care products are intended for external use only."
      },
      {
        "type": "paragraph",
        "text": "Products should not be ingested, injected, inhaled, used internally, or used in any manner inconsistent with labeling instructions or applicable law."
      },
      {
        "type": "paragraph",
        "text": "Avoid contact with eyes, mucous membranes, broken skin, irritated skin, and sensitive areas unless specifically indicated for such use. Keep products out of reach of children and pets."
      },
      {
        "type": "heading2",
        "text": "Wholesale, Private Label, and Manufacturing Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "Customers purchasing products for resale, private labeling, reformulation, repackaging, manufacturing, distribution, export, or commercial use assume full responsibility for:"
      },
      {
        "type": "listItem",
        "text": "Product testing"
      },
      {
        "type": "listItem",
        "text": "Stability testing"
      },
      {
        "type": "listItem",
        "text": "Compatibility testing"
      },
      {
        "type": "listItem",
        "text": "Preservative efficacy testing (PET)"
      },
      {
        "type": "listItem",
        "text": "Labeling compliance"
      },
      {
        "type": "listItem",
        "text": "Regulatory compliance"
      },
      {
        "type": "listItem",
        "text": "Claims substantiation"
      },
      {
        "type": "listItem",
        "text": "Safety assessments"
      },
      {
        "type": "listItem",
        "text": "Packaging compatibility"
      },
      {
        "type": "listItem",
        "text": "Marketing compliance"
      },
      {
        "type": "listItem",
        "text": "Insurance requirements"
      },
      {
        "type": "listItem",
        "text": "Import/export compliance"
      },
      {
        "type": "listItem",
        "text": "Marketplace compliance"
      },
      {
        "type": "listItem",
        "text": "Retailer compliance"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO disclaims responsibility for how products are reformulated, relabeled, repackaged, marketed, distributed, or used after transfer to the customer."
      },
      {
        "type": "heading2",
        "text": "International Sales and Export"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO products are formulated, manufactured, labeled, and intended for sale in the United States and may not comply with the laws, regulations, ingredient restrictions, labeling requirements, or registration requirements of other jurisdictions, including, without limitation, the European Union, United Kingdom, Japan, Canada, Australia, China, or other countries."
      },
      {
        "type": "paragraph",
        "text": "Customers purchasing products for export, international resale, or use outside the United States assume full responsibility for compliance with all applicable foreign laws, regulations, customs requirements, ingredient restrictions, labeling requirements, registration requirements, and import permits. COCOJOJO makes no representation or warranty regarding the legality, suitability, or acceptability of any product in any jurisdiction outside the United States."
      },
      {
        "type": "heading2",
        "text": "No Warranty"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by applicable law, all products, Services, content, materials, and information are provided \"AS IS\" and \"AS AVAILABLE\" without warranties of any kind, whether express or implied."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO expressly disclaims all warranties, including without limitation:"
      },
      {
        "type": "listItem",
        "text": "Merchantability"
      },
      {
        "type": "listItem",
        "text": "Fitness for a particular purpose"
      },
      {
        "type": "listItem",
        "text": "Non-infringement"
      },
      {
        "type": "listItem",
        "text": "Accuracy"
      },
      {
        "type": "listItem",
        "text": "Reliability"
      },
      {
        "type": "listItem",
        "text": "Availability"
      },
      {
        "type": "listItem",
        "text": "Safety"
      },
      {
        "type": "listItem",
        "text": "Performance"
      },
      {
        "type": "listItem",
        "text": "Regulatory compliance"
      },
      {
        "type": "listItem",
        "text": "Compatibility"
      },
      {
        "type": "listItem",
        "text": "Commercial success"
      },
      {
        "type": "listItem",
        "text": "Continuous operation"
      },
      {
        "type": "listItem",
        "text": "Error-free operation"
      },
      {
        "type": "heading2",
        "text": "Limitation of Liability"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, COCOJOJO shall not be liable for any direct, indirect, incidental, consequential, special, exemplary, punitive, or other damages arising from or relating to:"
      },
      {
        "type": "listItem",
        "text": "Product use"
      },
      {
        "type": "listItem",
        "text": "Product misuse"
      },
      {
        "type": "listItem",
        "text": "Allergic reactions"
      },
      {
        "type": "listItem",
        "text": "Adverse events"
      },
      {
        "type": "listItem",
        "text": "Skin irritation"
      },
      {
        "type": "listItem",
        "text": "Sensitivity reactions"
      },
      {
        "type": "listItem",
        "text": "Reliance on information"
      },
      {
        "type": "listItem",
        "text": "Manufacturing outcomes"
      },
      {
        "type": "listItem",
        "text": "Commercial losses"
      },
      {
        "type": "listItem",
        "text": "Regulatory actions"
      },
      {
        "type": "listItem",
        "text": "Product recalls"
      },
      {
        "type": "listItem",
        "text": "Loss of profits"
      },
      {
        "type": "listItem",
        "text": "Business interruption"
      },
      {
        "type": "listItem",
        "text": "Data loss"
      },
      {
        "type": "listItem",
        "text": "Consumer claims"
      },
      {
        "type": "listItem",
        "text": "Third-party actions"
      },
      {
        "type": "table",
        "rows": [
          [
            "AGGREGATE LIABILITY CAP TO THE FULLEST EXTENT PERMITTED BY LAW, COCOJOJO'S TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATING TO ANY PRODUCT, SERVICE, CONTENT, COMMUNICATION, OR TRANSACTION SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT ACTUALLY PAID BY YOU TO COCOJOJO FOR THE SPECIFIC PRODUCT OR SERVICE GIVING RISE TO THE CLAIM IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00). THIS LIMITATION APPLIES REGARDLESS OF THE FORM OR THEORY OF ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE, WARRANTY, OR OTHERWISE, AND EVEN IF COCOJOJO HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES."
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, COCOJOJO's liability shall be limited to the maximum extent permitted by applicable law. Nothing in this Disclaimer is intended to limit any rights or remedies that cannot be waived under applicable law."
      },
      {
        "type": "paragraph",
        "text": "Use of products and Services is solely at the user's own risk."
      },
      {
        "type": "heading2",
        "text": "Dispute Resolution and Incorporation of Terms"
      },
      {
        "type": "paragraph",
        "text": "Any disputes, claims, or controversies arising out of or relating to this Disclaimer, the Services, or any COCOJOJO product shall be governed by, and resolved in accordance with, the dispute-resolution provisions, mandatory arbitration clauses, class-action and collective-action waivers, jury-trial waivers, limitations of liability, indemnification provisions, governing-law provisions, and forum-selection clauses contained in the COCOJOJO Terms of Service, which are incorporated herein by reference in their entirety and made a part of this Disclaimer."
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by applicable law, by accessing or using the Services or purchasing any COCOJOJO product, you agree to be bound by such provisions. If any term of this Disclaimer conflicts with the Terms of Service, the Terms of Service shall control with respect to dispute resolution, arbitration, waivers, and limitations of liability, except where applicable law provides otherwise or grants you non-waivable rights."
      },
      {
        "type": "heading2",
        "text": "Governing Terms"
      },
      {
        "type": "paragraph",
        "text": "This Disclaimer is incorporated into and subject to the COCOJOJO Terms of Service, Privacy Policy, Cookie Policy, and all other applicable policies and agreements. In the event of any conflict between this Disclaimer and another COCOJOJO policy, the more protective provision for COCOJOJO shall control, except where applicable law requires otherwise."
      },
      {
        "type": "heading2",
        "text": "Severability and Waiver"
      },
      {
        "type": "paragraph",
        "text": "If any provision of this Disclaimer is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable, or, if modification is not possible, severed from this Disclaimer, and the remaining provisions shall continue in full force and effect. No failure or delay by COCOJOJO in exercising any right or remedy under this Disclaimer shall constitute a waiver of such right or remedy."
      },
      {
        "type": "heading2",
        "text": "Contact Information"
      },
      {
        "type": "paragraph",
        "text": "If you have questions about this Disclaimer, please contact us:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "intellectual-property-ai-dmca-policy",
    "title": "Intellectual Property, Artificial Intelligence, Digital Media, and DMCA Policy",
    "footerLabel": "Intellectual Property, Artificial Intelligence, Digital Media, and DMCA Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Rules and reporting procedures for intellectual property, AI-generated content, digital media, copyright, trademark, DMCA, and platform content.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "INTELLECTUAL PROPERTY, ARTIFICIAL INTELLIGENCE,"
      },
      {
        "type": "paragraph",
        "text": "DIGITAL MEDIA, AND DMCA POLICY"
      },
      {
        "type": "heading2",
        "text": "1. Ownership of Intellectual Property"
      },
      {
        "type": "paragraph",
        "text": "All content, materials, technology, formulations, text, graphics, branding, layouts, renderings, website designs, software, databases, catalogs, documentation, product descriptions, ingredient systems, formulations, images, videos, AI-assisted media, AI-assisted content, packaging, labels, claimed trade dress, trademarks, service marks, logos, trade secrets, manufacturing methods, extraction methods, custom blends, proprietary systems, marketing materials, educational materials, demonstrations, digital media, and all other intellectual property appearing on or associated with COCOJOJO, COCO JOJO LLC, its websites, products, Services, digital platforms, catalogs, social media channels, advertisements, communications, marketplaces, portals, and marketing campaigns (collectively, the \"Content\") are owned by or licensed to COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") and are protected under United States and international intellectual property, copyright, trademark, trade secret, unfair competition, and related laws."
      },
      {
        "type": "paragraph",
        "text": "This includes, without limitation:"
      },
      {
        "type": "listItem",
        "text": "Lifestyle photography"
      },
      {
        "type": "listItem",
        "text": "AI-assisted imagery (created with human creative direction)"
      },
      {
        "type": "listItem",
        "text": "Product renderings"
      },
      {
        "type": "listItem",
        "text": "CGI simulations"
      },
      {
        "type": "listItem",
        "text": "Stock imagery licensed by COCOJOJO"
      },
      {
        "type": "listItem",
        "text": "Website graphics"
      },
      {
        "type": "listItem",
        "text": "Website layout and design"
      },
      {
        "type": "listItem",
        "text": "Marketing copy"
      },
      {
        "type": "listItem",
        "text": "Product descriptions"
      },
      {
        "type": "listItem",
        "text": "Ingredient descriptions"
      },
      {
        "type": "listItem",
        "text": "Educational materials"
      },
      {
        "type": "listItem",
        "text": "Catalogs and downloadable materials"
      },
      {
        "type": "listItem",
        "text": "Social media content"
      },
      {
        "type": "listItem",
        "text": "Videos and animations"
      },
      {
        "type": "listItem",
        "text": "Demonstration visuals"
      },
      {
        "type": "listItem",
        "text": "Before-and-after depictions (illustrative)"
      },
      {
        "type": "listItem",
        "text": "AI-assisted text (created with human creative direction)"
      },
      {
        "type": "listItem",
        "text": "Automated marketing copy edited and curated by COCOJOJO personnel"
      },
      {
        "type": "listItem",
        "text": "Digital media"
      },
      {
        "type": "listItem",
        "text": "Packaging designs"
      },
      {
        "type": "listItem",
        "text": "Label designs"
      },
      {
        "type": "listItem",
        "text": "Claimed trade dress (where applicable)"
      },
      {
        "type": "listItem",
        "text": "Technical documentation"
      },
      {
        "type": "listItem",
        "text": "SDS, COA, and TDS formatting"
      },
      {
        "type": "listItem",
        "text": "Formulations and formulation structures"
      },
      {
        "type": "listItem",
        "text": "Ingredient systems, functional blends, encapsulation systems, preservation systems, texture systems"
      },
      {
        "type": "listItem",
        "text": "Extraction methods, manufacturing methods, and manufacturing know-how"
      },
      {
        "type": "listItem",
        "text": "Custom formulations and proprietary sourcing information"
      },
      {
        "type": "listItem",
        "text": "Databases and compilations"
      },
      {
        "type": "listItem",
        "text": "Business methods, proprietary systems, and processes"
      },
      {
        "type": "listItem",
        "text": "Future-developed content and technologies whether currently known or later developed"
      },
      {
        "type": "heading3",
        "text": "Note on AI Authorship and Human Creative Direction"
      },
      {
        "type": "paragraph",
        "text": "Consistent with current U.S. Copyright Office guidance (including the Copyright Office's March 2023 statement on works containing AI-generated material and the decision in Thaler v. Perlmutter, D.D.C. 2023), COCOJOJO asserts intellectual-property rights in Content that involves substantial human creative direction, selection, arrangement, editing, or curation. To the extent any individual element of Content is purely machine-generated and not protectable by copyright under applicable law, COCOJOJO nevertheless asserts all other applicable rights, including rights in the compilation, arrangement, selection, expression, presentation, branding context, and accompanying human-authored elements, and reserves all rights under contract, trademark, trade-secret, unfair-competition, and database-protection laws."
      },
      {
        "type": "paragraph",
        "text": "All rights not expressly granted are reserved by COCOJOJO."
      },
      {
        "type": "heading2",
        "text": "2. Artificial Intelligence, Stock Imagery, and Digital Media Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO uses artificial intelligence (\"AI\"), machine-learning technologies, automated content-generation systems, generative AI systems, CGI technologies, digital rendering software, enhancement tools, editing systems, synthetic media technologies, stock imagery, licensed media, automated translations, virtual design systems, and similar technologies in connection with the creation, modification, enhancement, optimization, publication, or distribution of content associated with the Services."
      },
      {
        "type": "paragraph",
        "text": "Certain Content - including, without limitation, images, videos, product renderings, simulations, before-and-after visuals, product depictions, packaging renderings, ingredient visuals, texture depictions, foam depictions, lifestyle imagery, wellness visuals, AI-generated media, AI-generated descriptions, marketing materials, demonstrations, social media content, and educational graphics - may be:"
      },
      {
        "type": "listItem",
        "text": "AI-generated"
      },
      {
        "type": "listItem",
        "text": "AI-assisted"
      },
      {
        "type": "listItem",
        "text": "Artistically enhanced"
      },
      {
        "type": "listItem",
        "text": "Digitally modified or retouched"
      },
      {
        "type": "listItem",
        "text": "Simulated, conceptual, or composite in nature"
      },
      {
        "type": "listItem",
        "text": "Generated using stock photography"
      },
      {
        "type": "listItem",
        "text": "Licensed from third-party providers"
      },
      {
        "type": "listItem",
        "text": "Created for illustrative, conceptual, educational, editorial, branding, inspirational, or marketing purposes only"
      },
      {
        "type": "table",
        "rows": [
          [
            "IMPORTANT - AI, STOCK PHOTOS, AND ILLUSTRATIVE IMAGERY COCOJOJO uses artificial intelligence (AI) tools and stock photography to create or assist in creating product images, marketing visuals, before-and-after depictions, lifestyle imagery, and other Content. Such images may not reflect actual products, actual results, actual user outcomes, or actual ingredient appearance, and are provided solely for illustrative, conceptual, branding, and marketing purposes. COCOJOJO's in-house and contracted design, marketing, social-media, and creative teams are creative and marketing professionals, not licensed scientists, dermatologists, cosmetic chemists, toxicologists, pharmacists, or medical practitioners. Visual depictions of product performance, skin response, fragrance, texture, ingredient behavior, or cosmetic outcomes are theoretical, illustrative, and aspirational representations created in good faith by these creative teams to communicate the intended concept of a product - they are not scientific demonstrations, clinical proof, laboratory results, or guarantees of any kind. By accessing or using the Services, users acknowledge that they are aware of, and on notice of, the foregoing. Users further acknowledge and agree that no purchasing, application, formulation, manufacturing, resale, or other decision should be based solely upon any visual representation, AI-generated content, stock photograph, before-and-after image, simulation, rendering, demonstration, or marketing aesthetic appearing on or distributed through the Services."
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Without limiting the foregoing, such Content may not represent actual products, actual packaging, actual inventory, actual product color, actual texture, actual viscosity, actual fragrance, actual ingredient appearance, actual cosmetic outcomes, actual consumer experiences, typical results, scientifically proven outcomes, clinically validated outcomes, or guaranteed efficacy."
      },
      {
        "type": "paragraph",
        "text": "Nothing appearing in any AI-generated content, renderings, visual depictions, demonstrations, simulations, stock imagery, marketing materials, social media content, or digital media shall constitute medical advice, dermatological advice, pharmaceutical advice, clinical proof, scientific proof, FDA approval, guaranteed efficacy, guaranteed cosmetic results, typical user outcomes, drug claims, or therapeutic claims."
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, COCOJOJO disclaims all liability arising from reliance upon AI-generated content, AI-generated descriptions, AI inaccuracies or hallucinations, stock photography, renderings, simulations, before-and-after images, digital enhancements, visual discrepancies, marketing representations, consumer perception claims, differences between rendered and actual products, third-party media inaccuracies, and automated content-generation errors."
      },
      {
        "type": "heading2",
        "text": "3. Trademarks"
      },
      {
        "type": "paragraph",
        "text": "\"COCOJOJO,\" \"COCO JOJO,\" related logos, slogans, branding elements, claimed trade dress (where applicable), product names, and associated identifiers are trademarks, service marks, or proprietary brand assets of COCO JOJO LLC, and are protected under the Lanham Act, 15 U.S.C. SectionSection 1051 et seq., California Bus. & Prof. Code Section 14200 et seq., and applicable state and international trademark laws."
      },
      {
        "type": "paragraph",
        "text": "Users may not:"
      },
      {
        "type": "listItem",
        "text": "Copy or imitate branding"
      },
      {
        "type": "listItem",
        "text": "Use confusingly similar names or designs"
      },
      {
        "type": "listItem",
        "text": "Register confusingly similar domains"
      },
      {
        "type": "listItem",
        "text": "Create misleading social media accounts"
      },
      {
        "type": "listItem",
        "text": "Misrepresent affiliation with COCOJOJO"
      },
      {
        "type": "listItem",
        "text": "Use trademarks in advertising without authorization"
      },
      {
        "type": "listItem",
        "text": "Use branding in a manner likely to create confusion, dilution, deception, or unfair competition"
      },
      {
        "type": "heading2",
        "text": "4. Right of Publicity and Endorsement Content"
      },
      {
        "type": "paragraph",
        "text": "Content appearing on the Services may include depictions, photographs, videos, voices, names, likenesses, signatures, or other identifying attributes of models, influencers, brand ambassadors, employees, customers, or other individuals who have provided appropriate releases or licenses. All such uses are protected, where applicable, under California Civ. Code Section 3344 (statutory right of publicity), California common-law right of publicity, the Lanham Act, and analogous state and international laws."
      },
      {
        "type": "paragraph",
        "text": "Users may not copy, reproduce, redistribute, or otherwise exploit any individual's name, likeness, voice, signature, or other indicia of identity appearing in COCOJOJO Content without express prior written authorization from COCOJOJO and, where applicable, the individual depicted."
      },
      {
        "type": "paragraph",
        "text": "Consistent with the Federal Trade Commission's Endorsement Guides (16 C.F.R. Part 255), COCOJOJO discloses material connections with endorsers where required and reserves all rights and remedies against any party that misappropriates, falsifies, or misuses endorsement content associated with COCOJOJO."
      },
      {
        "type": "heading2",
        "text": "5. Limited License"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO grants users a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to access and use the Services solely for lawful personal or internal business purposes."
      },
      {
        "type": "paragraph",
        "text": "This license does not permit:"
      },
      {
        "type": "listItem",
        "text": "Republishing Content"
      },
      {
        "type": "listItem",
        "text": "Reproducing images"
      },
      {
        "type": "listItem",
        "text": "Reproducing product descriptions"
      },
      {
        "type": "listItem",
        "text": "Copying catalogs"
      },
      {
        "type": "listItem",
        "text": "Commercial scraping"
      },
      {
        "type": "listItem",
        "text": "AI scraping or dataset training"
      },
      {
        "type": "listItem",
        "text": "Reverse engineering"
      },
      {
        "type": "listItem",
        "text": "Downloading databases"
      },
      {
        "type": "listItem",
        "text": "Using content for competing businesses"
      },
      {
        "type": "listItem",
        "text": "Creating derivative works"
      },
      {
        "type": "listItem",
        "text": "Republishing marketing materials"
      },
      {
        "type": "listItem",
        "text": "Misappropriating proprietary information"
      },
      {
        "type": "listItem",
        "text": "Counterfeit production"
      },
      {
        "type": "listItem",
        "text": "Unauthorized resale using COCOJOJO branding"
      },
      {
        "type": "listItem",
        "text": "Replicating formulations or systems"
      },
      {
        "type": "paragraph",
        "text": "Any unauthorized use immediately terminates any license granted by COCOJOJO."
      },
      {
        "type": "heading2",
        "text": "6. Formulations, Trade Secrets, and Proprietary Systems"
      },
      {
        "type": "paragraph",
        "text": "Unless otherwise expressly agreed in a separate written agreement signed by an authorized officer of COCOJOJO, all formulations, formula structures, ingredient systems, manufacturing processes, extraction methods, stability systems, functional blends, texture systems, encapsulation systems, preservation systems, surfactant systems, product concepts, R&D developments, samples, manufacturing methodologies, technical modifications, proprietary sourcing information, technical data, performance data, know-how, and trade secrets remain the exclusive intellectual property, confidential information, and proprietary property of COCOJOJO."
      },
      {
        "type": "paragraph",
        "text": "Such information is protected as trade secrets under the federal Defend Trade Secrets Act of 2016, 18 U.S.C. SectionSection 1836 et seq. (\"DTSA\"), the California Uniform Trade Secrets Act, Cal. Civ. Code SectionSection 3426 et seq. (\"CUTSA\"), the Economic Espionage Act, 18 U.S.C. SectionSection 1831 et seq., and applicable common-law confidentiality and unfair-competition principles. COCOJOJO takes reasonable measures to protect the secrecy of such information, and disclosure or use of such information without authorization may give rise to civil and criminal liability."
      },
      {
        "type": "paragraph",
        "text": "The purchase of a product does not transfer ownership of any formulation, intellectual property right, rendering, manufacturing methodology, trade secret, or proprietary information."
      },
      {
        "type": "paragraph",
        "text": "Customers may not:"
      },
      {
        "type": "listItem",
        "text": "Reverse engineer products"
      },
      {
        "type": "listItem",
        "text": "Analyze products for duplication purposes"
      },
      {
        "type": "listItem",
        "text": "Replicate formulas"
      },
      {
        "type": "listItem",
        "text": "Misappropriate proprietary systems"
      },
      {
        "type": "listItem",
        "text": "Share proprietary samples with competitors"
      },
      {
        "type": "listItem",
        "text": "Submit proprietary materials for unauthorized benchmarking"
      },
      {
        "type": "listItem",
        "text": "Manufacture competing products using COCOJOJO developments"
      },
      {
        "type": "heading2",
        "text": "7. Unauthorized Sellers, Counterfeit Products, and Platform Enforcement"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO actively monitors and enforces its rights against unauthorized sellers, counterfeiters, infringers, gray-market distributors, diverted-goods sellers, unauthorized online marketplace sellers, and entities selling imitation, diluted, expired, relabeled, tampered, altered, or counterfeit products."
      },
      {
        "type": "paragraph",
        "text": "Unauthorized sales may void warranties, invalidate authenticity assurances, violate intellectual property laws, violate unfair competition laws (including California Bus. & Prof. Code Section 17200 et seq.), and result in legal action."
      },
      {
        "type": "heading3",
        "text": "Platform Brand-Protection Programs"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO utilizes, and reserves the right to utilize, brand-protection and intellectual-property enforcement programs offered by online marketplaces, social media platforms, payment processors, and search engines, including without limitation:"
      },
      {
        "type": "listItem",
        "text": "marketplace service providers Brand Registry and Project Zero"
      },
      {
        "type": "listItem",
        "text": "eBay Verified Rights Owner (VeRO) Program"
      },
      {
        "type": "listItem",
        "text": "Walmart Brand Portal"
      },
      {
        "type": "listItem",
        "text": "Etsy Reporting Tool"
      },
      {
        "type": "listItem",
        "text": "third-party advertising providers (social media platforms and social media platforms) Brand Rights Protection / Intellectual Property Reporting"
      },
      {
        "type": "listItem",
        "text": "social media platforms Intellectual Property Protection Portal"
      },
      {
        "type": "listItem",
        "text": "YouTube Content ID and Copyright Match Tool"
      },
      {
        "type": "listItem",
        "text": "third-party technology providers Trademark Complaints and Web Search Removals"
      },
      {
        "type": "listItem",
        "text": "ecommerce service providers DMCA and Trademark Notice procedures"
      },
      {
        "type": "listItem",
        "text": "social media platforms, Snapchat, X (social media platforms), and other platform IP enforcement programs"
      },
      {
        "type": "heading3",
        "text": "Reserved Enforcement Rights"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO reserves the right to:"
      },
      {
        "type": "listItem",
        "text": "Submit marketplace and social-media takedown requests"
      },
      {
        "type": "listItem",
        "text": "Report infringers to platforms, payment processors, and registrars"
      },
      {
        "type": "listItem",
        "text": "Suspend accounts, distributorships, and reseller relationships"
      },
      {
        "type": "listItem",
        "text": "Restrict supply access"
      },
      {
        "type": "listItem",
        "text": "Refuse future sales"
      },
      {
        "type": "listItem",
        "text": "Pursue injunctive relief"
      },
      {
        "type": "listItem",
        "text": "Seek monetary damages, including statutory damages under 17 U.S.C. Section 504 and 15 U.S.C. Section 1117"
      },
      {
        "type": "listItem",
        "text": "Seek attorneys' fees and costs"
      },
      {
        "type": "listItem",
        "text": "Cooperate with law enforcement and regulatory agencies"
      },
      {
        "type": "paragraph",
        "text": "Consumers purchasing from unauthorized sellers do so entirely at their own risk."
      },
      {
        "type": "heading2",
        "text": "8. Copyright Infringement and DMCA Policy"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO respects intellectual property rights and expects users to do the same. In accordance with the Digital Millennium Copyright Act (\"DMCA\"), 17 U.S.C. Section 512, COCOJOJO will respond to valid notices of alleged copyright infringement."
      },
      {
        "type": "heading3",
        "text": "Designated DMCA Agent"
      },
      {
        "type": "paragraph",
        "text": "In accordance with 17 U.S.C. Section 512(c)(2), COCOJOJO has designated an agent to receive notifications of claimed copyright infringement. The Designated Agent is registered with the United States Copyright Office, and current contact information is publicly available through the Copyright Office's DMCA Designated Agent Directory at https://www.copyright.gov/dmca-directory."
      },
      {
        "type": "heading3",
        "text": "Submitting a DMCA Notice"
      },
      {
        "type": "paragraph",
        "text": "If you believe material appearing on the Services infringes your copyright, you may submit a written DMCA notice containing:"
      },
      {
        "type": "listItem",
        "text": "Identification of the copyrighted work claimed to have been infringed"
      },
      {
        "type": "listItem",
        "text": "Identification of the allegedly infringing material and its location"
      },
      {
        "type": "listItem",
        "text": "Your full legal name and contact information"
      },
      {
        "type": "listItem",
        "text": "A statement that you have a good-faith belief the use is unauthorized"
      },
      {
        "type": "listItem",
        "text": "A statement made under penalty of perjury that the information provided is accurate and that you are authorized to act on behalf of the copyright owner"
      },
      {
        "type": "listItem",
        "text": "Your physical or electronic signature"
      },
      {
        "type": "paragraph",
        "text": "DMCA notices should be sent to:"
      },
      {
        "type": "paragraph",
        "text": "Email: support@cocojojo.com"
      },
      {
        "type": "paragraph",
        "text": "Subject Line: \"DMCA Notice\""
      },
      {
        "type": "heading3",
        "text": "Counter Notifications"
      },
      {
        "type": "paragraph",
        "text": "If you believe material was removed in error, you may submit a counter notification pursuant to 17 U.S.C. Section 512(g) containing:"
      },
      {
        "type": "listItem",
        "text": "Identification of removed material"
      },
      {
        "type": "listItem",
        "text": "Your contact information"
      },
      {
        "type": "listItem",
        "text": "A statement under penalty of perjury that removal resulted from mistake or misidentification"
      },
      {
        "type": "listItem",
        "text": "Consent to jurisdiction of the appropriate federal district court"
      },
      {
        "type": "listItem",
        "text": "Your physical or electronic signature"
      },
      {
        "type": "heading3",
        "text": "Repeat Infringer Policy"
      },
      {
        "type": "paragraph",
        "text": "In accordance with 17 U.S.C. Section 512(i)(1)(A), COCOJOJO maintains and reasonably implements a policy of terminating, in appropriate circumstances, the accounts, distributorships, reseller relationships, affiliate accounts, or other user privileges of any user, customer, distributor, reseller, or affiliate who is determined to be a repeat infringer of copyright or other intellectual-property rights. Determinations are made by COCOJOJO in its sole reasonable discretion based on all available information, including the number, nature, and severity of prior notices."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO reserves the right to remove, restrict, disable, suspend, or terminate allegedly infringing materials, content, accounts, distributors, resellers, affiliates, or users at its sole discretion."
      },
      {
        "type": "heading3",
        "text": "False Claims"
      },
      {
        "type": "paragraph",
        "text": "Pursuant to 17 U.S.C. Section 512(f), any person who knowingly materially misrepresents that material is infringing, or that material was removed by mistake or misidentification, may be liable for damages, including costs and attorneys' fees."
      },
      {
        "type": "heading2",
        "text": "9. AI Training, Scraping, and Data Mining Restrictions"
      },
      {
        "type": "paragraph",
        "text": "Without express prior written authorization from COCOJOJO, users may not:"
      },
      {
        "type": "listItem",
        "text": "Use Content for AI training"
      },
      {
        "type": "listItem",
        "text": "Use Content for machine-learning datasets"
      },
      {
        "type": "listItem",
        "text": "Use Content for generative AI systems, foundation-model training, or fine-tuning"
      },
      {
        "type": "listItem",
        "text": "Scrape or harvest data"
      },
      {
        "type": "listItem",
        "text": "Use bots or automated crawlers"
      },
      {
        "type": "listItem",
        "text": "Extract images, formulations, descriptions, or technical information"
      },
      {
        "type": "listItem",
        "text": "Build competing datasets"
      },
      {
        "type": "listItem",
        "text": "Use COCOJOJO content to train or improve artificial intelligence systems"
      },
      {
        "type": "paragraph",
        "text": "Unauthorized scraping, automated harvesting, and circumvention of technical access controls may violate, among other laws, the federal Computer Fraud and Abuse Act, 18 U.S.C. Section 1030, California Penal Code Section 502 (the California Comprehensive Computer Data Access and Fraud Act), the DMCA's anti-circumvention provisions (17 U.S.C. Section 1201), and applicable contract, copyright, and unfair-competition laws. COCOJOJO reserves all rights and remedies available under such laws, including injunctive relief and recovery of damages, costs, and attorneys' fees."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO expressly reserves all rights relating to AI training, text and data mining, machine-learning usage, automated scraping, and dataset generation. This Policy constitutes a machine-readable and human-readable reservation of rights for purposes of any applicable text-and-data-mining exception under foreign law."
      },
      {
        "type": "heading2",
        "text": "10. Reservation of Rights"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO reserves all rights and remedies available under:"
      },
      {
        "type": "listItem",
        "text": "United States Copyright Act, 17 U.S.C. SectionSection 101 et seq."
      },
      {
        "type": "listItem",
        "text": "Digital Millennium Copyright Act, 17 U.S.C. Section 512 and Section 1201"
      },
      {
        "type": "listItem",
        "text": "Lanham Act, 15 U.S.C. SectionSection 1051 et seq."
      },
      {
        "type": "listItem",
        "text": "Defend Trade Secrets Act, 18 U.S.C. SectionSection 1836 et seq."
      },
      {
        "type": "listItem",
        "text": "Economic Espionage Act, 18 U.S.C. SectionSection 1831 et seq."
      },
      {
        "type": "listItem",
        "text": "Computer Fraud and Abuse Act, 18 U.S.C. Section 1030"
      },
      {
        "type": "listItem",
        "text": "California Uniform Trade Secrets Act, Cal. Civ. Code SectionSection 3426 et seq."
      },
      {
        "type": "listItem",
        "text": "California Unfair Competition Law, Cal. Bus. & Prof. Code Section 17200 et seq."
      },
      {
        "type": "listItem",
        "text": "California False Advertising Law, Cal. Bus. & Prof. Code Section 17500 et seq."
      },
      {
        "type": "listItem",
        "text": "California Comprehensive Computer Data Access and Fraud Act, Cal. Penal Code Section 502"
      },
      {
        "type": "listItem",
        "text": "California Right of Publicity, Cal. Civ. Code Section 3344 and common law"
      },
      {
        "type": "listItem",
        "text": "Contract law and equitable doctrines including injunctive relief"
      },
      {
        "type": "listItem",
        "text": "International intellectual property laws, treaties, and conventions"
      },
      {
        "type": "paragraph",
        "text": "Failure to enforce any right shall not constitute a waiver of such right."
      },
      {
        "type": "heading2",
        "text": "11. Limitation of Liability"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, COCOJOJO shall not be liable for damages arising from:"
      },
      {
        "type": "listItem",
        "text": "Unauthorized third-party copying"
      },
      {
        "type": "listItem",
        "text": "Counterfeit products"
      },
      {
        "type": "listItem",
        "text": "Marketplace or social-media infringement"
      },
      {
        "type": "listItem",
        "text": "AI-generated inaccuracies"
      },
      {
        "type": "listItem",
        "text": "Stock photography inaccuracies"
      },
      {
        "type": "listItem",
        "text": "User misuse of Content"
      },
      {
        "type": "listItem",
        "text": "Reliance on marketing materials, AI-assisted visuals, or illustrative imagery"
      },
      {
        "type": "listItem",
        "text": "Unauthorized reseller conduct"
      },
      {
        "type": "listItem",
        "text": "Removal of allegedly infringing material"
      },
      {
        "type": "listItem",
        "text": "Suspension or termination of accounts"
      },
      {
        "type": "listItem",
        "text": "Third-party misuse of intellectual property"
      },
      {
        "type": "listItem",
        "text": "Consumer reliance on visual depictions or AI-generated content"
      },
      {
        "type": "table",
        "rows": [
          [
            "AGGREGATE LIABILITY CAP TO THE FULLEST EXTENT PERMITTED BY LAW, COCOJOJO'S TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATING TO THIS POLICY, ANY CONTENT, AND ANY USE OF OR RELIANCE UPON AI-GENERATED, AI-ASSISTED, OR STOCK IMAGERY SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT ACTUALLY PAID BY YOU TO COCOJOJO FOR THE SPECIFIC PRODUCT OR SERVICE GIVING RISE TO THE CLAIM IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00). THIS LIMITATION APPLIES REGARDLESS OF THE FORM OR THEORY OF ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE, WARRANTY, OR OTHERWISE, AND IS CONSISTENT WITH THE LIABILITY CAP SET FORTH IN THE COCOJOJO DISCLAIMER AND TERMS OF SERVICE."
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, COCOJOJO's liability shall be limited to the maximum extent permitted by applicable law. Nothing in this Policy is intended to limit any rights or remedies that cannot be waived under applicable law."
      },
      {
        "type": "heading2",
        "text": "12. Incorporation of Other Policies and Dispute Resolution"
      },
      {
        "type": "paragraph",
        "text": "This Policy is incorporated into and subject to the COCOJOJO Terms of Service, Privacy Policy, Cookie Policy, Disclaimer, and all other applicable policies and agreements. Any dispute, claim, or controversy arising out of or relating to this Policy shall be governed by, and resolved in accordance with, the dispute-resolution provisions, mandatory arbitration clauses, class-action and collective-action waivers, jury-trial waivers, limitations of liability, indemnification provisions, governing-law provisions, and forum-selection clauses contained in the COCOJOJO Terms of Service, which are incorporated herein by reference."
      },
      {
        "type": "heading2",
        "text": "13. Severability and Waiver"
      },
      {
        "type": "paragraph",
        "text": "If any provision of this Policy is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable, or, if modification is not possible, severed from this Policy, and the remaining provisions shall continue in full force and effect. No failure or delay by COCOJOJO in exercising any right or remedy under this Policy shall constitute a waiver of such right or remedy."
      },
      {
        "type": "heading2",
        "text": "14. Contact Information"
      },
      {
        "type": "paragraph",
        "text": "For questions about this Policy or to report intellectual property concerns:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "affiliate-ambassador-influencer-creator-terms",
    "title": "Affiliate, Ambassador, Influencer, and Creator Program Terms",
    "footerLabel": "Affiliate, Ambassador, Influencer, and Creator Program Terms",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Terms for affiliate, ambassador, influencer, creator, referral, promotional, social media, and partnership programs.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "AFFILIATE, AMBASSADOR, INFLUENCER,"
      },
      {
        "type": "heading2",
        "text": "1. Overview"
      },
      {
        "type": "paragraph",
        "text": "These Affiliate, Ambassador, Influencer, Creator, and Referral Program Terms (\"Influencer Terms\") govern participation in any affiliate, ambassador, influencer, creator, referral, promotional, social media, partnership, sponsorship, marketing, brand advocate, commission, or collaboration program offered by COCO JOJO LLC and the COCOJOJO brand (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\")."
      },
      {
        "type": "paragraph",
        "text": "By participating in any COCOJOJO affiliate, influencer, ambassador, creator, referral, promotional, or partnership activity, you (\"Participant,\" \"Influencer,\" \"Affiliate,\" \"Creator,\" or \"Ambassador\") agree to comply with these Influencer Terms, the COCOJOJO Terms of Service, Privacy Policy, Cookie Policy, Disclaimer, Intellectual Property Policy, and all other applicable policies and agreements, each of which is incorporated herein by reference. If you do not agree, you may not participate."
      },
      {
        "type": "heading2",
        "text": "2. Independent Contractor Relationship"
      },
      {
        "type": "paragraph",
        "text": "Participants are independent contractors and are not employees, agents, partners, franchisees, representatives, joint venturers, or legal representatives of COCOJOJO. Nothing in these Influencer Terms creates any employment relationship, agency relationship, fiduciary relationship, joint venture, partnership, authority to bind COCOJOJO, or authority to make representations on behalf of COCOJOJO."
      },
      {
        "type": "paragraph",
        "text": "Participants may not present themselves as official representatives, employees, medical professionals, regulatory authorities, or authorized spokespeople of COCOJOJO unless expressly authorized in writing by an authorized officer of COCOJOJO."
      },
      {
        "type": "paragraph",
        "text": "Participants are solely responsible for the manner and means of performing their promotional activities, supply their own equipment, and bear all costs of their participation. This relationship is intended to satisfy the independent-contractor standards under applicable law, and Participants waive any claim to employee status, benefits, or protections to the fullest extent permitted by law."
      },
      {
        "type": "heading2",
        "text": "3. Taxes and Financial Responsibility"
      },
      {
        "type": "paragraph",
        "text": "Participants are solely responsible for the reporting and payment of all federal, state, local, and foreign taxes arising from any compensation, commissions, free products, gifts, or other consideration received in connection with any COCOJOJO program. COCOJOJO does not withhold taxes on behalf of Participants."
      },
      {
        "type": "paragraph",
        "text": "Where required by law, COCOJOJO will issue an IRS Form 1099 (or applicable equivalent) for Participants receiving compensation at or above the applicable reporting threshold. Participants are responsible for providing accurate taxpayer identification information (e.g., IRS Form W-9 or W-8). The fair market value of any free products, gifted items, or other non-cash consideration may constitute taxable income to the Participant."
      },
      {
        "type": "heading2",
        "text": "4. FTC Compliance and Mandatory Disclosure Requirements"
      },
      {
        "type": "paragraph",
        "text": "Participants are solely responsible for complying with all applicable laws, regulations, platform rules, advertising requirements, endorsement guidelines, and disclosure obligations, including without limitation:"
      },
      {
        "type": "listItem",
        "text": "Federal Trade Commission (\"FTC\") Act, 15 U.S.C. Section 45, and the FTC Guides Concerning the Use of Endorsements and Testimonials in Advertising, 16 C.F.R. Part 255 (as revised in 2023)"
      },
      {
        "type": "listItem",
        "text": "The FTC Rule on the Use of Consumer Reviews and Testimonials, 16 C.F.R. Part 465 (effective October 2024)"
      },
      {
        "type": "listItem",
        "text": "The FTC Health Products Compliance Guidance (2022) and its \"competent and reliable scientific evidence\" substantiation standard"
      },
      {
        "type": "listItem",
        "text": "California Unfair Competition Law, Cal. Bus. & Prof. Code Section 17200 et seq."
      },
      {
        "type": "listItem",
        "text": "California False Advertising Law, Cal. Bus. & Prof. Code Section 17500 et seq."
      },
      {
        "type": "listItem",
        "text": "California Consumers Legal Remedies Act, Cal. Civ. Code Section 1750 et seq."
      },
      {
        "type": "listItem",
        "text": "Federal and state consumer-protection, truth-in-advertising, and influencer-marketing laws"
      },
      {
        "type": "listItem",
        "text": "All applicable social media platform rules and disclosure requirements"
      },
      {
        "type": "listItem",
        "text": "All applicable international marketing and advertising regulations"
      },
      {
        "type": "paragraph",
        "text": "Participants must clearly and conspicuously disclose any material connection with COCOJOJO in all endorsements, promotions, social media posts, videos, livestreams, stories, blogs, reviews, testimonials, advertisements, or other promotional content. Required disclosures may include, without limitation, \"#ad,\" \"#sponsored,\" \"#affiliate,\" \"Paid partnership,\" \"Sponsored by COCOJOJO,\" or similar legally compliant disclosures."
      },
      {
        "type": "paragraph",
        "text": "Disclosures must be clear, conspicuous, easy to understand, difficult to miss, placed before any \"more\" or truncation cutoff, unavoidable in video and audio content, and otherwise compliant with applicable law and platform requirements. Reliance on platform-provided disclosure tools alone does not satisfy this obligation."
      },
      {
        "type": "paragraph",
        "text": "Failure to properly disclose sponsored relationships may result in immediate termination, forfeiture of unpaid compensation, and full liability of the Participant, including under the indemnification provisions of these Influencer Terms."
      },
      {
        "type": "heading2",
        "text": "5. No False, Misleading, or Unauthorized Claims"
      },
      {
        "type": "paragraph",
        "text": "Participants may not make any false, misleading, deceptive, unsubstantiated, unauthorized, or non-compliant statements regarding COCOJOJO products or Services. Prohibited claims include, without limitation:"
      },
      {
        "type": "listItem",
        "text": "Medical, drug, disease-treatment, therapeutic, or pharmaceutical claims"
      },
      {
        "type": "listItem",
        "text": "FDA approval or FDA clearance claims"
      },
      {
        "type": "listItem",
        "text": "Guaranteed-results, \"cure,\" \"permanent,\" or \"instant\" claims"
      },
      {
        "type": "listItem",
        "text": "Scientific or clinical claims without competent and reliable scientific substantiation"
      },
      {
        "type": "listItem",
        "text": "Misleading before-and-after claims"
      },
      {
        "type": "listItem",
        "text": "Earnings or income guarantees"
      },
      {
        "type": "listItem",
        "text": "Safety guarantees"
      },
      {
        "type": "listItem",
        "text": "Claims inconsistent with product labeling or COCOJOJO materials"
      },
      {
        "type": "listItem",
        "text": "Claims that products diagnose, treat, cure, mitigate, or prevent any disease"
      },
      {
        "type": "listItem",
        "text": "Misrepresentations of ingredients, certifications, product origins, manufacturing standards, or testing results"
      },
      {
        "type": "listItem",
        "text": "Any claim prohibited by applicable law or advertising rules"
      },
      {
        "type": "paragraph",
        "text": "Participants may not present cosmetics as drugs, make therapeutic or pharmaceutical claims, or imply efficacy not supported by legally sufficient substantiation. Participants are solely responsible for all statements, claims, captions, hashtags, testimonials, videos, reviews, comments, livestreams, and promotional content they create or publish, and bear sole liability for any such content."
      },
      {
        "type": "heading2",
        "text": "6. Before-and-After, Reviews, and Cosmetic Representation Restrictions"
      },
      {
        "type": "paragraph",
        "text": "Participants may not create or publish misleading before-and-after imagery, cosmetic demonstrations, product comparisons, visual simulations, AI-generated cosmetic outcomes, or edited or manipulated cosmetic results without clearly disclosing material editing, filters, enhancements, or simulations where required by applicable law or platform rules."
      },
      {
        "type": "paragraph",
        "text": "Participants may not imply that results are typical, guaranteed, scientifically proven, medically verified, permanent, or FDA-approved unless expressly authorized by COCOJOJO in writing and supported by legally sufficient substantiation."
      },
      {
        "type": "table",
        "rows": [
          [
            "ACKNOWLEDGMENT - FAKE AND AI-GENERATED REVIEWS PROHIBITED Participants acknowledge that the FTC Rule on the Use of Consumer Reviews and Testimonials (16 C.F.R. Part 465), effective October 2024, prohibits fake, AI-generated, incentivized-but-undisclosed, and materially misleading reviews and testimonials, and authorizes civil penalties of up to the statutory maximum per violation (currently exceeding $50,000 per violation). Participants represent, warrant, and covenant that they will not create, commission, solicit, buy, sell, or publish any fake, fabricated, AI-generated, deceptive, or undisclosed-incentivized review, testimonial, or endorsement regarding COCOJOJO, and that all reviews and testimonials will reflect the Participant's honest, good-faith, and genuine experience. Participants assume sole and full liability for any violation."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "7. Intellectual Property and Brand Usage"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO grants Participants a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to use approved COCOJOJO branding, trademarks, product images, and marketing materials solely for authorized promotional purposes during the approved relationship term. This license may be revoked at any time, with or without cause, in COCOJOJO's sole discretion."
      },
      {
        "type": "paragraph",
        "text": "Participants may not modify branding without authorization, alter logos, create confusingly similar brands, register domain names or social handles containing COCOJOJO marks, create unauthorized advertisements, misrepresent affiliation, use copyrighted materials outside authorized purposes, use COCOJOJO intellectual property after termination, or use brand assets in unlawful, offensive, defamatory, misleading, or non-compliant content."
      },
      {
        "type": "paragraph",
        "text": "All goodwill associated with COCOJOJO intellectual property belongs exclusively to COCOJOJO. COCOJOJO's rights are protected under the Lanham Act, 15 U.S.C. SectionSection 1051 et seq., California Bus. & Prof. Code Section 14200 et seq. and Section 17200 et seq., and applicable state, federal, and international laws."
      },
      {
        "type": "heading3",
        "text": "License-Back of Participant Content"
      },
      {
        "type": "paragraph",
        "text": "Participant grants COCOJOJO a perpetual, irrevocable, worldwide, royalty-free, fully paid-up, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, distribute, display, and create derivative works from any content, photographs, videos, reviews, testimonials, name, likeness, voice, and social media handles created by the Participant in connection with COCOJOJO, across all media now known or later developed, for advertising, marketing, and promotional purposes, without further compensation, approval, attribution, or notice, to the fullest extent permitted by law. Participant waives any moral rights and right of publicity claims against COCOJOJO with respect to such authorized use."
      },
      {
        "type": "heading2",
        "text": "8. AI, Editing, Filters, and Synthetic Media"
      },
      {
        "type": "paragraph",
        "text": "Participants may not use AI-generated endorsements, deepfakes, synthetic voiceovers, artificial cosmetic simulations, misleading filters, misleading AI enhancements, fabricated testimonials, fake reviews, or manipulated clinical depictions in a manner that is deceptive, misleading, unlawful, or likely to create false impressions regarding products or results."
      },
      {
        "type": "paragraph",
        "text": "Any AI-generated or materially edited content used in connection with COCOJOJO promotions must comply with FTC guidelines, the FTC consumer-review rule (16 C.F.R. Part 465), platform rules, advertising laws, consumer-protection laws, and COCOJOJO brand standards, and must disclose AI generation or material editing where required. COCOJOJO reserves the right to require modification or removal of any AI-generated, synthetic, edited, manipulated, or misleading content at any time and in its sole discretion."
      },
      {
        "type": "heading2",
        "text": "9. Social Media Conduct"
      },
      {
        "type": "paragraph",
        "text": "Participants may not publish content that is unlawful, defamatory, discriminatory, hateful, sexually explicit, violent, misleading, infringing of intellectual property rights, in violation of platform rules, damaging to COCOJOJO's reputation, creative of regulatory risk, encouraging of unsafe product usage, or in violation of advertising laws."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO reserves the right to require removal of any content that it determines, in its sole discretion, may expose the Company to legal, reputational, regulatory, commercial, or operational risk."
      },
      {
        "type": "heading2",
        "text": "10. Privacy and Data Protection Obligations"
      },
      {
        "type": "paragraph",
        "text": "If a Participant collects, receives, or processes any personal information in connection with COCOJOJO promotional activities (including, without limitation, through giveaways, sweepstakes, email collection, referral links, or analytics), the Participant is solely responsible for complying with all applicable privacy laws, including without limitation the California Consumer Privacy Act as amended by the California Privacy Rights Act (CCPA/CPRA), the CAN-SPAM Act, the Telephone Consumer Protection Act (TCPA), and all other applicable data-protection, anti-spam, and consumer-protection laws. Participants shall not represent that COCOJOJO is responsible for the Participant's data practices and shall indemnify COCOJOJO for any claims arising from the Participant's handling of personal information."
      },
      {
        "type": "heading2",
        "text": "11. Compliance with Platform Rules"
      },
      {
        "type": "paragraph",
        "text": "Participants are solely responsible for complying with the rules, guidelines, policies, monetization requirements, advertising restrictions, disclosure requirements, and terms of all platforms used in connection with promotional activities, including without limitation social media platforms, social media platforms, YouTube, social media platforms, X/social media platforms, social media platforms, Snapchat, LinkedIn, blogs, podcasts, livestreaming platforms, affiliate platforms, and marketplaces."
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO is not responsible for platform penalties, bans, demonetization, shadow bans, account suspensions, content removals, or algorithmic impacts affecting Participants."
      },
      {
        "type": "heading2",
        "text": "12. Monitoring and Content Removal"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO reserves the right, but not the obligation, to monitor Participant content, review posts and campaigns, request edits, require disclosures, require removals, suspend campaigns, reject content, restrict brand usage, and remove Participants from programs at any time and in its sole discretion. Participants agree to promptly comply with any content-removal or modification request made by COCOJOJO, and in no event later than twenty-four (24) hours after such request."
      },
      {
        "type": "heading2",
        "text": "13. No Guaranteed Compensation or Results"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO makes no guarantees regarding compensation, commissions, sales, reach, engagement, exposure, revenue, conversion rates, affiliate earnings, campaign success, or program availability. Compensation structures, commission rates, cookie windows, attribution methods, payout thresholds, and program terms may be modified, suspended, reduced, or terminated at any time in COCOJOJO's sole discretion, with or without notice. COCOJOJO reserves the right to withhold, reverse, or deny commissions for returned products, fraudulent or self-referred orders, chargebacks, policy violations, or any conduct COCOJOJO determines, in its sole discretion, to be improper."
      },
      {
        "type": "heading2",
        "text": "14. Representations and Warranties"
      },
      {
        "type": "paragraph",
        "text": "Each Participant represents, warrants, and covenants that: (a) they are at least 18 years of age and have full legal authority to enter into these Influencer Terms; (b) all content they publish is original or properly licensed and does not infringe any third-party rights; (c) all statements they make about COCOJOJO products are truthful, accurate, substantiated, and compliant with applicable law; (d) they will comply with all applicable laws, regulations, platform rules, and COCOJOJO policies; (e) they will make all required disclosures; and (f) they will not engage in any conduct that could harm COCOJOJO's reputation, goodwill, or legal standing."
      },
      {
        "type": "heading2",
        "text": "15. Indemnification"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, Participants agree to defend, indemnify, and hold harmless COCOJOJO and its affiliates, subsidiaries, officers, directors, members, managers, employees, licensors, agents, contractors, service providers, successors, and assigns (collectively, the \"Indemnified Parties\") from and against any and all claims, liabilities, damages, judgments, awards, penalties, investigations, governmental or regulatory actions, fines, losses, settlements, costs, and expenses (including reasonable attorneys' fees, expert fees, and costs of investigation and defense) arising from or relating to:"
      },
      {
        "type": "listItem",
        "text": "FTC violations, including under 16 C.F.R. Part 255 and Part 465"
      },
      {
        "type": "listItem",
        "text": "False, misleading, deceptive, or unsubstantiated advertising claims"
      },
      {
        "type": "listItem",
        "text": "Unauthorized, medical, drug, or therapeutic claims"
      },
      {
        "type": "listItem",
        "text": "Intellectual property infringement"
      },
      {
        "type": "listItem",
        "text": "Disclosure failures"
      },
      {
        "type": "listItem",
        "text": "Platform violations"
      },
      {
        "type": "listItem",
        "text": "Consumer complaints or claims"
      },
      {
        "type": "listItem",
        "text": "Regulatory investigations or enforcement actions, including under California Bus. & Prof. Code Section 17200 and Section 17500"
      },
      {
        "type": "listItem",
        "text": "Defamation, right-of-publicity, or privacy claims"
      },
      {
        "type": "listItem",
        "text": "Violations of privacy, anti-spam, or data-protection laws (including CCPA/CPRA, CAN-SPAM, and TCPA)"
      },
      {
        "type": "listItem",
        "text": "Any content created, published, or distributed by the Participant"
      },
      {
        "type": "listItem",
        "text": "Any breach of these Influencer Terms or any representation or warranty herein"
      },
      {
        "type": "listItem",
        "text": "The Participant's negligence, willful misconduct, or violation of any law"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO reserves the right, at its own option and expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by the Participant, and in such event the Participant agrees to cooperate fully with COCOJOJO's defense. The Participant shall not settle any claim affecting the Indemnified Parties without COCOJOJO's prior written consent. This indemnification obligation is in addition to, and not in lieu of, any other rights or remedies available to COCOJOJO, and is not subject to the liability cap set forth below."
      },
      {
        "type": "heading2",
        "text": "16. Limitation of Liability"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, COCOJOJO and the Indemnified Parties shall not be liable for any lost profits, lost revenue, lost opportunities, account bans, algorithm changes, platform actions, demonetization, indirect, incidental, consequential, special, exemplary, or punitive damages, reputational harm, campaign performance issues, or third-party actions, whether based in contract, tort, strict liability, negligence, warranty, or any other theory, and even if advised of the possibility of such damages."
      },
      {
        "type": "table",
        "rows": [
          [
            "AGGREGATE LIABILITY CAP TO THE FULLEST EXTENT PERMITTED BY LAW, COCOJOJO'S TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATING TO THESE INFLUENCER TERMS OR ANY COCOJOJO PROGRAM SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL COMMISSIONS OR COMPENSATION ACTUALLY PAID BY COCOJOJO TO THE PARTICIPANT IN THE THREE (3) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00). THIS LIMITATION APPLIES REGARDLESS OF THE FORM OR THEORY OF ACTION AND IS CONSISTENT WITH THE LIABILITY CAPS SET FORTH IN THE COCOJOJO DISCLAIMER, INTELLECTUAL PROPERTY POLICY, AND TERMS OF SERVICE."
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Some jurisdictions do not allow the exclusion or limitation of certain damages; in such jurisdictions, COCOJOJO's liability shall be limited to the maximum extent permitted by applicable law. Participation in any COCOJOJO influencer or affiliate program is entirely at the Participant's own risk."
      },
      {
        "type": "heading2",
        "text": "17. Termination"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may suspend, restrict, or terminate any Participant, relationship, campaign, affiliate account, ambassador status, or promotional authorization at any time, with or without notice, and with or without cause, in its sole and absolute discretion. Participants may terminate their participation at any time by ceasing all promotional activity and notifying COCOJOJO."
      },
      {
        "type": "paragraph",
        "text": "Upon termination: (a) all licenses immediately terminate; (b) Participants must immediately cease using COCOJOJO branding, trademarks, and content; (c) Participants must remove unauthorized promotional materials upon request; and (d) any unpaid commissions may be forfeited where termination results from a Participant's breach or misconduct, to the fullest extent permitted by law."
      },
      {
        "type": "heading2",
        "text": "18. Survival"
      },
      {
        "type": "paragraph",
        "text": "All provisions of these Influencer Terms which by their nature should survive termination shall survive, including, without limitation, Sections 3 (Taxes), 5 (No False Claims), 7 (Intellectual Property, including the License-Back), 10 (Privacy), 14 (Representations and Warranties), 15 (Indemnification), 16 (Limitation of Liability), 18 (Survival), 19 (Dispute Resolution), and 20 (General Provisions)."
      },
      {
        "type": "heading2",
        "text": "19. Dispute Resolution, Arbitration, and Class-Action Waiver"
      },
      {
        "type": "paragraph",
        "text": "Any dispute, claim, or controversy arising out of or relating to these Influencer Terms or any COCOJOJO program shall be governed by, and resolved in accordance with, the dispute-resolution provisions, mandatory binding arbitration clauses, class-action and collective-action waivers, jury-trial waivers, limitations of liability, governing-law provisions, and forum-selection clauses contained in the COCOJOJO Terms of Service, which are incorporated herein by reference in their entirety. To the fullest extent permitted by law, the Participant waives any right to participate in a class action, collective action, or representative action, and agrees that disputes shall be resolved on an individual basis. These Influencer Terms shall be governed by the laws of the State of California, without regard to its conflict-of-laws principles, and the exclusive venue for any dispute not subject to arbitration shall be the state and federal courts located in Orange County, California."
      },
      {
        "type": "heading2",
        "text": "20. General Provisions"
      },
      {
        "type": "paragraph",
        "text": "These Influencer Terms, together with the documents incorporated by reference, constitute the entire agreement between the parties regarding the subject matter and supersede all prior agreements. If any provision is held invalid, illegal, or unenforceable, it shall be modified to the minimum extent necessary to be enforceable, or severed, and the remaining provisions shall continue in full force and effect. No failure or delay by COCOJOJO in exercising any right or remedy shall constitute a waiver. COCOJOJO may modify these Influencer Terms at any time, with changes effective upon posting; continued participation constitutes acceptance. COCOJOJO may assign these Influencer Terms freely; Participants may not assign without COCOJOJO's prior written consent. In the event of any conflict between these Influencer Terms and another COCOJOJO policy, the provision more protective of COCOJOJO shall control, except where applicable law requires otherwise."
      },
      {
        "type": "heading2",
        "text": "21. Contact Information"
      },
      {
        "type": "paragraph",
        "text": "For questions about these Influencer Terms or any COCOJOJO program:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "sms-mobile-messaging-terms",
    "title": "SMS & Mobile Messaging Terms",
    "footerLabel": "SMS & Mobile Messaging Terms",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Terms for SMS, MMS, mobile messaging, abandoned-cart messages, order updates, promotional texts, and related mobile communications.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. Overview and Consent"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC and the COCOJOJO brand (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") may offer SMS, MMS, mobile messaging, abandoned-cart messaging, order updates, promotional texts, transactional alerts, marketing messages, and related mobile communications (collectively, the \"SMS Program\")."
      },
      {
        "type": "paragraph",
        "text": "By providing your mobile number, checking a consent box, entering your phone number at checkout, creating an account, signing up for promotions, joining our SMS Program, or otherwise opting in, you expressly consent to receive recurring automated and non-automated text messages from COCOJOJO at the phone number provided, including messages sent using an automatic telephone dialing system or similar technology where applicable."
      },
      {
        "type": "table",
        "rows": [
          [
            "EXPRESS WRITTEN CONSENT - TCPA ACKNOWLEDGMENT By opting in, you provide your prior express written consent under the Telephone Consumer Protection Act (TCPA), 47 U.S.C. Section 227, and its implementing regulations (47 C.F.R. Section 64.1200), to receive autodialed and pre-written marketing and transactional text messages from COCOJOJO at the mobile number you provide. Consent to receive marketing text messages is NOT a condition of any purchase. You may revoke consent at any time by replying STOP. Message frequency varies. Message and data rates may apply."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "2. Types of Messages"
      },
      {
        "type": "paragraph",
        "text": "Messages may include, without limitation:"
      },
      {
        "type": "listItem",
        "text": "Promotional offers and limited-time offers"
      },
      {
        "type": "listItem",
        "text": "Product announcements"
      },
      {
        "type": "listItem",
        "text": "Abandoned-cart reminders"
      },
      {
        "type": "listItem",
        "text": "Order, shipping, and delivery updates"
      },
      {
        "type": "listItem",
        "text": "Account alerts and security notifications"
      },
      {
        "type": "listItem",
        "text": "Marketing and loyalty/referral campaigns"
      },
      {
        "type": "listItem",
        "text": "Wholesale and B2B account updates"
      },
      {
        "type": "listItem",
        "text": "Customer service communications"
      },
      {
        "type": "heading2",
        "text": "3. Message Frequency, Rates, and Carrier Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "Message frequency may vary based on your interactions with us. Message and data rates may apply according to your mobile carrier plan. Carriers (including, without limitation, AT&T, Verizon, T-Mobile, and their affiliates) are not liable for delayed or undelivered messages. COCOJOJO does not guarantee that messages will be delivered, timely, or error-free, and is not responsible for any carrier charges you incur."
      },
      {
        "type": "heading2",
        "text": "4. How to Opt Out and Get Help"
      },
      {
        "type": "paragraph",
        "text": "You may opt out of the SMS Program at any time by replying STOP to any message. After texting STOP, you may receive one final confirmation message confirming your opt-out, after which no further messages will be sent unless you re-enroll. For help, reply HELP or contact support@cocojojo.com. Standard message and data rates may apply to STOP and HELP messages."
      },
      {
        "type": "paragraph",
        "text": "You may continue to receive transactional, account-related, or legally required messages where permitted by law even after opting out of marketing messages, to the extent such messages are not subject to the marketing opt-out."
      },
      {
        "type": "heading2",
        "text": "5. Your Representations Regarding the Phone Number"
      },
      {
        "type": "paragraph",
        "text": "You represent and warrant that: (a) you are at least 18 years of age; (b) you are the account holder or authorized user of the mobile number you provide; (c) the number you provide is accurate and not a false, third-party, or unauthorized number; and (d) you will notify COCOJOJO immediately if your number changes, is ported, is deactivated, or is reassigned."
      },
      {
        "type": "heading2",
        "text": "6. Reassigned and Unauthorized Numbers"
      },
      {
        "type": "paragraph",
        "text": "Mobile numbers are periodically reassigned by carriers to new users. COCOJOJO is not responsible for messages sent to a number you provided if that number is later reassigned, transferred, changed, ported, deactivated, or is no longer controlled by you, where COCOJOJO has not received notice of the change. You agree not to provide a false, inaccurate, unauthorized, or third-party phone number."
      },
      {
        "type": "table",
        "rows": [
          [
            "INDEMNIFICATION FOR UNAUTHORIZED NUMBERS To the fullest extent permitted by law, you agree to defend, indemnify, and hold harmless COCOJOJO and its affiliates, officers, directors, employees, and agents from and against any and all claims, liabilities, damages, penalties, statutory damages (including under the TCPA), costs, and expenses (including reasonable attorneys' fees) arising from or relating to your provision of an unauthorized, inaccurate, reassigned, ported, or third-party phone number, or your failure to notify COCOJOJO of any change to your number."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "7. Third-Party Messaging Providers"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may use third-party providers, including without limitation email and SMS service providers or similar mobile messaging platforms, to send and manage SMS communications. Such providers act as our service providers and process information in accordance with our Privacy Policy and applicable data processing agreements."
      },
      {
        "type": "heading2",
        "text": "8. Privacy"
      },
      {
        "type": "paragraph",
        "text": "Information collected through the SMS Program is handled in accordance with the COCOJOJO Privacy Policy. We do not sell mobile phone numbers collected for the SMS Program. Mobile opt-in data and consent are not shared with third parties for their own marketing purposes."
      },
      {
        "type": "heading2",
        "text": "9. Program Changes and Termination"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may modify, suspend, or terminate the SMS Program, in whole or in part, at any time and in its sole discretion, with or without notice. COCOJOJO may also modify these SMS Terms at any time, with changes effective upon posting; continued participation after posting constitutes acceptance."
      },
      {
        "type": "heading2",
        "text": "10. Limitation of Liability"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, COCOJOJO shall not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages arising from or relating to the SMS Program, including undelivered or delayed messages, carrier charges, or reassigned-number messages. COCOJOJO's total aggregate liability arising from the SMS Program shall not exceed one hundred U.S. dollars ($100.00), consistent with the liability caps in the COCOJOJO Disclaimer and Terms of Service, except where applicable law provides otherwise or grants non-waivable rights."
      },
      {
        "type": "heading2",
        "text": "11. Dispute Resolution"
      },
      {
        "type": "paragraph",
        "text": "Any dispute, claim, or controversy arising out of or relating to these SMS Terms or the SMS Program shall be governed by, and resolved in accordance with, the dispute-resolution provisions, mandatory arbitration clauses, class-action and collective-action waivers, jury-trial waivers, and governing-law provisions contained in the COCOJOJO Terms of Service, which are incorporated herein by reference. These SMS Terms are governed by California law, without regard to conflict-of-laws principles."
      },
      {
        "type": "heading2",
        "text": "12. Incorporation"
      },
      {
        "type": "paragraph",
        "text": "These SMS Terms are incorporated into and subject to the COCOJOJO Terms of Service, Privacy Policy, Cookie Policy, Disclaimer, Intellectual Property Policy, and all other applicable COCOJOJO policies and agreements."
      },
      {
        "type": "heading2",
        "text": "13. Contact Information"
      },
      {
        "type": "paragraph",
        "text": "For questions about the SMS Program or these SMS Terms:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "wholesale-b2b-private-label-custom-manufacturing-terms",
    "title": "Wholesale, B2B, Private Label, and Custom Manufacturing Terms & Conditions",
    "footerLabel": "Wholesale, B2B, Private Label, and Custom Manufacturing Terms & Conditions",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Terms for wholesale, B2B, private label, white label, OEM, ODM, contract manufacturing, reseller, distributor, and custom manufacturing services.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "WHOLESALE, B2B, PRIVATE LABEL,"
      },
      {
        "type": "heading2",
        "text": "1. Scope and Acceptance"
      },
      {
        "type": "paragraph",
        "text": "These Wholesale, B2B, Private Label, and Custom Manufacturing Terms & Conditions (\"Wholesale Terms\") govern all wholesale, business-to-business, distribution, reseller, private label, white label, OEM, ODM, contract manufacturing, and custom formulation transactions between COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") and any business customer (\"Customer,\" \"you,\" or \"your\"). By submitting a purchase order, accepting a quotation, or purchasing products on a wholesale or commercial basis, you agree to these Wholesale Terms, which prevail over any conflicting terms in your purchase order or other documents."
      },
      {
        "type": "heading2",
        "text": "2. Eligibility and Accounts"
      },
      {
        "type": "paragraph",
        "text": "Wholesale and commercial accounts are available only to bona fide businesses. You agree to provide accurate business information, including legal entity name, EIN, resale certificate, and other documentation we may require. COCOJOJO reserves the right to approve, decline, suspend, or terminate any account in its sole discretion. You are responsible for maintaining the confidentiality of your account credentials."
      },
      {
        "type": "heading2",
        "text": "3. Orders, Pricing, and Minimums"
      },
      {
        "type": "paragraph",
        "text": "All orders are subject to acceptance by COCOJOJO. Prices, minimum order quantities, and minimum order values are subject to change without notice and are confirmed at the time of order acceptance. Quotations are valid only for the period stated and are subject to product availability. Pricing does not include taxes, duties, shipping, or handling unless expressly stated."
      },
      {
        "type": "heading2",
        "text": "4. Payment Terms and Net-30 Credit"
      },
      {
        "type": "paragraph",
        "text": "Unless a written credit agreement provides otherwise, payment is due prior to shipment. Where COCOJOJO extends Net-30 or other credit terms, such terms are granted in COCOJOJO's sole discretion based on credit evaluation and may be modified or revoked at any time. Past-due balances accrue interest at the lesser of 1.5% per month or the maximum rate permitted by law. You agree to pay all costs of collection, including reasonable attorneys' fees. COCOJOJO may apply payments to any outstanding balance and may withhold shipment for any past-due account."
      },
      {
        "type": "heading2",
        "text": "5. Custom Manufacturing, Private Label, and Formulation"
      },
      {
        "type": "paragraph",
        "text": "For custom manufacturing, private label, white label, OEM/ODM, and custom formulation projects: (a) minimum order quantities, lead times, and specifications are established per project; (b) deposits are non-refundable once production or procurement begins; (c) Customer is responsible for approving all formulas, artwork, labels, and specifications prior to production, and bears full responsibility for the accuracy and legal compliance of Customer-supplied content; and (d) COCOJOJO is not liable for delays caused by Customer approval, supply-chain disruptions, or force majeure."
      },
      {
        "type": "table",
        "rows": [
          [
            "CUSTOMER COMPLIANCE RESPONSIBILITY Customer assumes full and sole responsibility for the regulatory compliance, safety substantiation, labeling, claims, marketing, testing (including stability and preservative-efficacy testing), and lawful sale of all products purchased for resale, private labeling, reformulation, repackaging, manufacturing, or distribution, in every jurisdiction in which Customer sells or distributes. COCOJOJO disclaims all responsibility for how products are reformulated, relabeled, repackaged, marketed, or distributed after transfer to Customer."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "6. Intellectual Property"
      },
      {
        "type": "paragraph",
        "text": "Unless otherwise agreed in a separate written agreement signed by an authorized officer of COCOJOJO, all formulations, formula structures, manufacturing processes, extraction methods, know-how, and trade secrets remain the exclusive property of COCOJOJO. Purchase of a product does not transfer any intellectual property right. Customer-supplied trademarks, artwork, and brand assets remain the property of Customer, who grants COCOJOJO a license to use them solely to fulfill the order. Customer represents that its content does not infringe any third-party rights and indemnifies COCOJOJO for any claim arising from Customer-supplied content."
      },
      {
        "type": "heading2",
        "text": "7. Inspection, Acceptance, Returns, and Variability"
      },
      {
        "type": "paragraph",
        "text": "Customer must inspect products upon receipt and notify COCOJOJO of any shortage, defect, or non-conformity within ten (10) business days of delivery; failure to do so constitutes acceptance. Wholesale, custom, and private label products are generally non-returnable except for verified manufacturing defects. Natural variation in color, scent, texture, and viscosity between lots is normal and does not constitute a defect."
      },
      {
        "type": "heading2",
        "text": "8. Shipping, Title, and Risk of Loss"
      },
      {
        "type": "paragraph",
        "text": "Unless otherwise agreed, shipping terms are FOB origin; title and risk of loss pass to Customer upon delivery to the carrier. COCOJOJO is not responsible for carrier delays, damage in transit, or customs matters. Customer is responsible for all shipping, freight, insurance, duties, and taxes."
      },
      {
        "type": "heading2",
        "text": "9. Warranties and Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO warrants that products will conform to agreed written specifications at the time of delivery. EXCEPT AS EXPRESSLY STATED, ALL PRODUCTS ARE PROVIDED \"AS IS\" AND COCOJOJO DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY LAW."
      },
      {
        "type": "heading2",
        "text": "10. Indemnification"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, Customer agrees to defend, indemnify, and hold harmless COCOJOJO and its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, penalties, regulatory actions, costs, and expenses (including reasonable attorneys' fees) arising from or relating to: Customer's resale, reformulation, relabeling, repackaging, marketing, or distribution of products; Customer-supplied content, formulas, claims, or artwork; Customer's regulatory non-compliance; or Customer's breach of these Wholesale Terms."
      },
      {
        "type": "heading2",
        "text": "11. Limitation of Liability"
      },
      {
        "type": "table",
        "rows": [
          [
            "AGGREGATE LIABILITY CAP TO THE FULLEST EXTENT PERMITTED BY LAW, COCOJOJO'S TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATING TO ANY ORDER OR THESE WHOLESALE TERMS SHALL NOT EXCEED THE AMOUNT ACTUALLY PAID BY CUSTOMER FOR THE SPECIFIC PRODUCTS GIVING RISE TO THE CLAIM. COCOJOJO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, EVEN IF ADVISED OF THE POSSIBILITY. THIS LIMITATION IS CONSISTENT WITH THE CAPS IN THE COCOJOJO DISCLAIMER AND TERMS OF SERVICE."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "12. Force Majeure"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO shall not be liable for any delay or failure to perform due to causes beyond its reasonable control, including acts of God, natural disasters, pandemics, war, terrorism, labor disputes, supply-chain disruptions, raw-material shortages, utility or transportation failures, cyberattacks, or governmental actions."
      },
      {
        "type": "heading2",
        "text": "13. Termination"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may suspend or terminate any account, order, or relationship at any time for breach, non-payment, or in its sole discretion. Upon termination, all outstanding amounts become immediately due, and Customer must cease use of COCOJOJO branding and confidential information."
      },
      {
        "type": "heading2",
        "text": "14. Dispute Resolution and Governing Law"
      },
      {
        "type": "paragraph",
        "text": "Any dispute arising out of or relating to these Wholesale Terms shall be governed by the dispute-resolution, mandatory arbitration, class-action waiver, jury-trial waiver, and governing-law provisions of the COCOJOJO Terms of Service, incorporated herein by reference. These Wholesale Terms are governed by California law, and the exclusive venue for any dispute not subject to arbitration is the state and federal courts in Orange County, California."
      },
      {
        "type": "heading2",
        "text": "15. General Provisions and Survival"
      },
      {
        "type": "paragraph",
        "text": "These Wholesale Terms, together with documents incorporated by reference, constitute the entire agreement. If any provision is unenforceable, it shall be modified or severed and the remainder shall continue. Sections concerning IP, indemnification, limitation of liability, and dispute resolution survive termination. In any conflict between these Wholesale Terms and another COCOJOJO policy, the provision more protective of COCOJOJO controls, except where law requires otherwise."
      },
      {
        "type": "heading2",
        "text": "16. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "authorized-seller-policy",
    "title": "Authorized Seller Policy",
    "footerLabel": "Authorized Seller Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Requirements for authorized sellers, resellers, distributors, marketplace listings, brand presentation, and product integrity.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. Purpose"
      },
      {
        "type": "paragraph",
        "text": "This Authorized Seller Policy (\"Policy\") establishes the requirements for any party authorized to sell, resell, or distribute COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") products. It protects the integrity of the COCOJOJO brand, ensures product authenticity and safety, and preserves a consistent customer experience across all sales channels."
      },
      {
        "type": "heading2",
        "text": "2. Authorized Sellers Only"
      },
      {
        "type": "paragraph",
        "text": "Only sellers expressly authorized in writing by COCOJOJO may advertise, market, list, or sell COCOJOJO-branded products. Authorization is non-transferable and may be granted, conditioned, limited, suspended, or revoked at any time in COCOJOJO's sole discretion. Purchasing products, whether directly or through a distributor, does not by itself confer authorized-seller status."
      },
      {
        "type": "heading2",
        "text": "3. Conditions of Authorization"
      },
      {
        "type": "paragraph",
        "text": "Authorized Sellers must, at all times:"
      },
      {
        "type": "listItem",
        "text": "Sell only genuine COCOJOJO products obtained through authorized channels"
      },
      {
        "type": "listItem",
        "text": "Comply with the COCOJOJO Minimum Advertised Price (MAP) Policy"
      },
      {
        "type": "listItem",
        "text": "Maintain accurate, non-misleading product listings consistent with COCOJOJO materials"
      },
      {
        "type": "listItem",
        "text": "Honor product authenticity, storage, handling, and expiration requirements"
      },
      {
        "type": "listItem",
        "text": "Refrain from altering, repackaging, relabeling, decanting, or tampering with products"
      },
      {
        "type": "listItem",
        "text": "Sell only through channels expressly approved by COCOJOJO"
      },
      {
        "type": "listItem",
        "text": "Comply with all applicable laws, regulations, and platform rules"
      },
      {
        "type": "listItem",
        "text": "Not make unauthorized medical, drug, therapeutic, or unsubstantiated claims"
      },
      {
        "type": "heading2",
        "text": "4. Prohibited Conduct"
      },
      {
        "type": "paragraph",
        "text": "The following are strictly prohibited and may result in immediate termination and legal action:"
      },
      {
        "type": "listItem",
        "text": "Selling counterfeit, imitation, diverted, gray-market, expired, or tampered products"
      },
      {
        "type": "listItem",
        "text": "Unauthorized sales on marketplaces (e.g., marketplace service providers, eBay, Walmart, Etsy) or social platforms"
      },
      {
        "type": "listItem",
        "text": "Reselling to other unauthorized sellers or distributors"
      },
      {
        "type": "listItem",
        "text": "Violating MAP pricing"
      },
      {
        "type": "listItem",
        "text": "Misrepresenting authenticity, origin, certification, or affiliation"
      },
      {
        "type": "listItem",
        "text": "Using COCOJOJO trademarks, images, or copy without authorization"
      },
      {
        "type": "heading2",
        "text": "5. Enforcement"
      },
      {
        "type": "table",
        "rows": [
          [
            "RESERVED ENFORCEMENT RIGHTS COCOJOJO actively monitors all sales channels and reserves the right to enforce this Policy through any lawful means, including: submitting marketplace and platform takedown requests (marketplace service providers Brand Registry, eBay VeRO, Walmart Brand Portal, third-party advertising providers and social media platforms IP portals, and similar programs); test purchases and authentication; suspending or terminating supply; refusing future sales; pursuing injunctive relief; and seeking monetary damages, statutory damages, and attorneys' fees under the Lanham Act (15 U.S.C. Section 1117), the Copyright Act, the Defend Trade Secrets Act, and California Bus. & Prof. Code Section 17200 et seq."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "6. Consumer Warning"
      },
      {
        "type": "paragraph",
        "text": "Products purchased from unauthorized sellers may be counterfeit, expired, diverted, improperly stored, or tampered with, and are not covered by any COCOJOJO authenticity assurance or warranty. Consumers purchasing from unauthorized sellers do so entirely at their own risk."
      },
      {
        "type": "heading2",
        "text": "7. No Waiver; Survival; Governing Law"
      },
      {
        "type": "paragraph",
        "text": "Failure to enforce any provision is not a waiver. Enforcement, indemnification, and IP provisions survive termination of authorization. This Policy is governed by California law and incorporated into the COCOJOJO Terms of Service, Wholesale Terms, Intellectual Property Policy, and all other applicable policies, including their arbitration and dispute-resolution provisions."
      },
      {
        "type": "heading2",
        "text": "8. Contact Information"
      },
      {
        "type": "paragraph",
        "text": "To report an unauthorized seller or counterfeit product, or to apply for authorization:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "map-policy",
    "title": "Minimum Advertised Price (MAP) Policy",
    "footerLabel": "Minimum Advertised Price (MAP) Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Minimum advertised price rules designed to protect the COCOJOJO brand and support authorized sellers.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "(MAP) POLICY"
      },
      {
        "type": "heading2",
        "text": "1. Purpose"
      },
      {
        "type": "paragraph",
        "text": "This Minimum Advertised Price (\"MAP\") Policy is adopted unilaterally by COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") to protect the value, reputation, and goodwill of the COCOJOJO brand and to support authorized sellers who invest in marketing genuine COCOJOJO products. This Policy is not an agreement and does not require acceptance; it is a unilateral policy under which COCOJOJO independently decides whether to continue doing business with any reseller."
      },
      {
        "type": "table",
        "rows": [
          [
            "UNILATERAL POLICY - NO AGREEMENT REQUIRED Consistent with United States v. Colgate & Co., 250 U.S. 300 (1919), this MAP Policy is a unilateral statement of the minimum prices at which COCOJOJO products may be advertised. COCOJOJO does not seek and will not accept any agreement from resellers regarding pricing. Resellers remain free to set their own actual resale prices; this Policy governs only ADVERTISED prices. COCOJOJO unilaterally reserves the right to cease doing business with any reseller that advertises below MAP."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "2. Scope"
      },
      {
        "type": "paragraph",
        "text": "This Policy applies to all advertised prices for COCOJOJO-branded products across all channels, including websites, marketplaces, social media, search and display advertising, email, print, and any other public-facing advertisement. \"Advertised price\" includes the price displayed in any public advertisement, as well as the use of coupons, promo codes, bundling, free-shipping offers, or other devices that have the net effect of advertising a price below MAP."
      },
      {
        "type": "heading2",
        "text": "3. MAP Pricing"
      },
      {
        "type": "paragraph",
        "text": "The MAP for each product is established by COCOJOJO and communicated to resellers through official price lists, which may be updated at any time. The current MAP price list, as published by COCOJOJO, is incorporated by reference. MAP does not apply to the actual price at which a product is sold, only to the advertised price."
      },
      {
        "type": "heading2",
        "text": "4. Permitted Exceptions"
      },
      {
        "type": "paragraph",
        "text": "The following do not violate this Policy: (a) the actual transaction price charged to a customer; (b) prices advertised only behind a login, in a cart, or via \"click to reveal price\" mechanisms not visible in public advertising; (c) clearance of discontinued or damaged items expressly authorized in writing by COCOJOJO; and (d) any exception COCOJOJO authorizes in writing."
      },
      {
        "type": "heading2",
        "text": "5. Enforcement"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO independently and unilaterally monitors advertised prices. If COCOJOJO determines that a reseller has advertised below MAP, COCOJOJO may, in its sole discretion and without negotiation or agreement, take action up to and including: issuing a notice; suspending or terminating the reseller's account or authorized-seller status; refusing to accept future orders; and ceasing all sales to the reseller. COCOJOJO will make these decisions unilaterally."
      },
      {
        "type": "heading2",
        "text": "6. No Agreement; No Waiver"
      },
      {
        "type": "paragraph",
        "text": "Nothing in this Policy constitutes or shall be construed as an agreement, contract, or understanding regarding resale prices. COCOJOJO's sales representatives are not authorized to discuss, negotiate, or accept assurances regarding MAP compliance. Failure to enforce this Policy in any instance is not a waiver of COCOJOJO's right to enforce it in any other instance."
      },
      {
        "type": "heading2",
        "text": "7. Governing Law"
      },
      {
        "type": "paragraph",
        "text": "This Policy is governed by and shall be administered consistent with applicable United States antitrust law and California law. This Policy is related to, but independent of, the COCOJOJO Authorized Seller Policy and Wholesale Terms."
      },
      {
        "type": "heading2",
        "text": "8. Contact Information"
      },
      {
        "type": "paragraph",
        "text": "For MAP price lists or questions about this Policy:"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "terms-of-purchase-and-sale",
    "title": "Terms of Purchase & Sale",
    "footerLabel": "Terms of Purchase & Sale",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Terms that apply to product purchases, orders, payment, shipping, delivery, returns, risk of loss, and purchase-related obligations.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. Application of These Terms"
      },
      {
        "type": "paragraph",
        "text": "These Terms of Purchase & Sale (\"Terms\") apply to all purchases of products from COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") by any customer (\"you\" or \"your\"). By placing an order through any channel, you agree to these Terms. For wholesale, B2B, private label, and custom manufacturing orders, the COCOJOJO Wholesale Terms also apply and control in the event of conflict."
      },
      {
        "type": "heading2",
        "text": "2. Orders and Acceptance"
      },
      {
        "type": "paragraph",
        "text": "Your order is an offer to purchase. All orders are subject to acceptance and product availability. COCOJOJO may accept, decline, limit, or cancel any order in its sole discretion, including orders that appear fraudulent, are placed by unauthorized resellers, contain pricing or product errors, or exceed quantity limits. A contract is formed only when COCOJOJO confirms or ships your order."
      },
      {
        "type": "heading2",
        "text": "3. Pricing and Errors"
      },
      {
        "type": "paragraph",
        "text": "Prices are subject to change without notice and are confirmed at the time of order acceptance. Despite reasonable efforts, products may occasionally be mispriced or inaccurately described. COCOJOJO reserves the right to correct errors and to cancel or refuse any order placed at an incorrect price, even after an order is confirmed. Prices exclude taxes, shipping, duties, and handling unless stated."
      },
      {
        "type": "heading2",
        "text": "4. Payment"
      },
      {
        "type": "paragraph",
        "text": "Payment is due at the time of purchase unless credit terms are separately agreed in writing. You represent that you are authorized to use the payment method provided. COCOJOJO uses third-party payment processors and does not store full payment card numbers. You authorize COCOJOJO and its processors to charge the applicable amount, including taxes and shipping."
      },
      {
        "type": "heading2",
        "text": "5. Shipping, Title, and Risk of Loss"
      },
      {
        "type": "paragraph",
        "text": "Shipping estimates are not guaranteed. Unless otherwise stated, title and risk of loss pass to you upon delivery to the carrier (FOB origin). COCOJOJO is not responsible for carrier delays, loss, or damage in transit. Claims for shortages or visible damage must be made within ten (10) business days of delivery."
      },
      {
        "type": "heading2",
        "text": "6. Returns, Refunds, and Cancellations"
      },
      {
        "type": "paragraph",
        "text": "Returns are accepted only in accordance with COCOJOJO's posted return policy. For health, safety, and hygiene reasons, certain cosmetic, personal care, opened, custom, and wholesale products are non-returnable except for verified manufacturing defects. Natural variation in color, scent, texture, and viscosity is normal and is not a defect. Custom, private label, and made-to-order products are non-cancellable and non-refundable once production begins."
      },
      {
        "type": "heading2",
        "text": "7. Product Use and Safety"
      },
      {
        "type": "paragraph",
        "text": "Products are for external cosmetic use only unless expressly labeled otherwise. You are responsible for reviewing ingredient lists, performing a patch test, and following all label instructions. COCOJOJO's product Disclaimer applies to all purchases and is incorporated by reference."
      },
      {
        "type": "heading2",
        "text": "8. Warranties and Disclaimer"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO warrants that products conform to their specifications at the time of delivery. EXCEPT AS EXPRESSLY STATED, ALL PRODUCTS ARE PROVIDED \"AS IS\" AND COCOJOJO DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, TO THE FULLEST EXTENT PERMITTED BY LAW."
      },
      {
        "type": "heading2",
        "text": "9. Limitation of Liability"
      },
      {
        "type": "table",
        "rows": [
          [
            "AGGREGATE LIABILITY CAP TO THE FULLEST EXTENT PERMITTED BY LAW, COCOJOJO'S TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATING TO ANY PURCHASE SHALL NOT EXCEED THE AMOUNT ACTUALLY PAID FOR THE PRODUCT GIVING RISE TO THE CLAIM. COCOJOJO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES. THIS LIMITATION IS CONSISTENT WITH THE CAPS IN THE COCOJOJO DISCLAIMER AND TERMS OF SERVICE, AND DOES NOT LIMIT ANY NON-WAIVABLE RIGHTS UNDER APPLICABLE LAW."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "10. Indemnification"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, you agree to indemnify and hold harmless COCOJOJO from claims arising from your misuse of products, resale of products, breach of these Terms, or violation of law."
      },
      {
        "type": "heading2",
        "text": "11. Dispute Resolution and Governing Law"
      },
      {
        "type": "paragraph",
        "text": "Any dispute arising from these Terms is subject to the dispute-resolution, mandatory arbitration, class-action waiver, jury-trial waiver, and governing-law provisions of the COCOJOJO Terms of Service, incorporated by reference. These Terms are governed by California law, with exclusive venue in Orange County, California for any matter not subject to arbitration."
      },
      {
        "type": "heading2",
        "text": "12. General"
      },
      {
        "type": "paragraph",
        "text": "These Terms, with documents incorporated by reference, are the entire agreement regarding purchases. Unenforceable provisions shall be modified or severed; the remainder continues. Sections on warranties, liability, indemnification, and dispute resolution survive. COCOJOJO may update these Terms at any time; the version in effect at the time of your order applies."
      },
      {
        "type": "heading2",
        "text": "13. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "security-anti-fraud-notice",
    "title": "Security & Anti Fraud Notice",
    "footerLabel": "Security & Anti Fraud Notice",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Security and anti-fraud notice explaining fraud prevention, customer precautions, suspicious communications, and payment safety.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "SECURITY & ANTI-FRAUD NOTICE"
      },
      {
        "type": "heading2",
        "text": "1. Purpose"
      },
      {
        "type": "paragraph",
        "text": "This Security & Anti-Fraud Notice describes how COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") protects against fraud and how you can protect yourself. Cybercriminals increasingly target businesses and their customers through impersonation, phishing, and fraudulent payment schemes. This Notice helps you verify that you are dealing with the genuine COCOJOJO."
      },
      {
        "type": "heading2",
        "text": "2. Official COCOJOJO Communications"
      },
      {
        "type": "table",
        "rows": [
          [
            "HOW TO VERIFY GENUINE COCOJOJO COMMUNICATIONS COCOJOJO's official communications originate exclusively from @COCOJOJO.com email addresses and our verified official channels. COCOJOJO will NEVER change its bank or wire instructions by email alone, and will never ask you to send payment to a new or different account without verification. ALWAYS independently verify any payment instructions, banking details, invoice changes, or wire instructions by calling a previously known, verified COCOJOJO contact using a phone number you already have on file - not a number contained in the suspect email - before transmitting any funds."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "3. Common Fraud Schemes to Watch For"
      },
      {
        "type": "listItem",
        "text": "Business email compromise (BEC) and spoofed sender addresses that look similar to @COCOJOJO.com"
      },
      {
        "type": "listItem",
        "text": "Fraudulent invoices or sudden \"updated\" banking or wire instructions"
      },
      {
        "type": "listItem",
        "text": "Phishing emails or texts requesting login credentials, payment, or personal information"
      },
      {
        "type": "listItem",
        "text": "Fake websites, look-alike domains, and fraudulent social media accounts"
      },
      {
        "type": "listItem",
        "text": "AI-generated or deepfake voice, video, or text impersonating COCOJOJO personnel"
      },
      {
        "type": "listItem",
        "text": "Requests for gift cards, cryptocurrency, or unusual payment methods"
      },
      {
        "type": "heading2",
        "text": "4. Our Security Measures"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO implements commercially reasonable administrative, technical, and physical safeguards, including encryption in transit, access controls, multi-factor authentication for administrative systems, fraud monitoring, security logging, employee training, and incident-response procedures. No system is completely secure, and we cannot guarantee absolute security."
      },
      {
        "type": "heading2",
        "text": "5. Your Responsibilities"
      },
      {
        "type": "paragraph",
        "text": "You are responsible for safeguarding your account credentials, verifying communications and payment instructions through known channels, keeping your contact information current, and promptly notifying us of any suspected fraud or unauthorized activity."
      },
      {
        "type": "heading2",
        "text": "6. Disclaimer of Liability for Third-Party Fraud"
      },
      {
        "type": "table",
        "rows": [
          [
            "WIRE FRAUD AND IMPERSONATION DISCLAIMER To the fullest extent permitted by law, COCOJOJO is not responsible or liable for losses arising from intercepted communications, fraudulent or altered wire instructions, phishing attacks, unauthorized email activity, cybercrime, payment fraud, deepfake or AI-generated impersonation, spoofed domains, fake social media accounts, or related third-party conduct, including any failure by you to independently verify payment instructions through a previously verified channel before transmitting funds."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "7. Reporting Fraud"
      },
      {
        "type": "paragraph",
        "text": "If you receive a suspicious communication purporting to be from COCOJOJO, or suspect fraud, do not respond, click links, or send funds. Contact us immediately at support@cocojojo.com using contact details you already have on file. You may also report fraud to your bank, the FTC (reportfraud.ftc.gov), and the FBI Internet Crime Complaint Center (ic3.gov)."
      },
      {
        "type": "heading2",
        "text": "8. Incorporation and Governing Law"
      },
      {
        "type": "paragraph",
        "text": "This Notice is incorporated into the COCOJOJO Privacy Policy, Terms of Service, and Terms of Purchase & Sale, and is governed by California law."
      },
      {
        "type": "heading2",
        "text": "9. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "international-sales-export-notice",
    "title": "International Sales & Export Notice",
    "footerLabel": "International Sales & Export Notice",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "International sales and export terms covering cross-border orders, import duties, customs, restricted destinations, and compliance obligations.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. Purpose and Scope"
      },
      {
        "type": "paragraph",
        "text": "This International Sales & Export Notice applies to all purchases, shipments, and transactions involving COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") products that are sold to, shipped to, exported to, or used in any jurisdiction outside the United States. It supplements the COCOJOJO Terms of Purchase & Sale, Wholesale Terms, and Privacy Policy."
      },
      {
        "type": "heading2",
        "text": "2. Products Formulated for the U.S. Market"
      },
      {
        "type": "table",
        "rows": [
          [
            "PRODUCTS INTENDED FOR THE U.S. MARKET COCOJOJO products are formulated, manufactured, labeled, and intended for sale in the United States and may NOT comply with the laws, regulations, ingredient restrictions, labeling requirements, registration requirements, or standards of other jurisdictions, including without limitation the European Union, United Kingdom, Japan, Canada, Australia, China, the Gulf states, or other countries. Customers purchasing for export, international resale, or use outside the United States assume full and sole responsibility for determining and ensuring compliance with all applicable foreign laws before importing, marketing, or selling any product. COCOJOJO makes no representation or warranty regarding the legality, suitability, registration status, or acceptability of any product in any jurisdiction outside the United States."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "3. Customer Responsibility for Import and Compliance"
      },
      {
        "type": "paragraph",
        "text": "Customers are solely responsible for: import licensing and permits; customs clearance, duties, tariffs, VAT, and taxes; product registration and notification (e.g., EU CPNP, UK SCPN, ASEAN, China NMPA); ingredient and labeling compliance; language and claims requirements; restricted or prohibited ingredient screening; and any market-specific testing or documentation. Customers are the importer of record unless otherwise agreed in writing."
      },
      {
        "type": "heading2",
        "text": "4. Export Controls and Sanctions"
      },
      {
        "type": "paragraph",
        "text": "You represent and warrant that you will comply with all applicable U.S. export-control and economic-sanctions laws, including those administered by the U.S. Department of Commerce (Export Administration Regulations) and the U.S. Department of the Treasury Office of Foreign Assets Control (OFAC). You will not export, re-export, or divert products to any embargoed or sanctioned country, region, entity, or individual, or for any prohibited end use. You are not a party listed on any U.S. restricted-party or denied-persons list."
      },
      {
        "type": "heading2",
        "text": "5. Customs Data and Disclosures"
      },
      {
        "type": "paragraph",
        "text": "You acknowledge that, to fulfill international orders, personal and commercial information - including names, addresses, tax identification numbers, and commercial details - may be shared with customs authorities, freight carriers, freight forwarders, customs brokers, import/export compliance services, and governmental agencies as required by applicable laws and customs regulations."
      },
      {
        "type": "heading2",
        "text": "6. Shipping, Title, and Risk of Loss"
      },
      {
        "type": "paragraph",
        "text": "Unless otherwise agreed in writing, international shipments are made FOB origin or EXW (Incoterms 2020 as specified on the order), and title and risk of loss pass to the Customer upon delivery to the carrier or freight forwarder. COCOJOJO is not responsible for delays, seizures, destruction, or losses arising from customs, inspection, or foreign regulatory action."
      },
      {
        "type": "heading2",
        "text": "7. No Liability for Foreign Regulatory Action"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, COCOJOJO is not liable for any seizure, detention, destruction, recall, fine, penalty, or loss arising from a product's non-compliance with foreign law, customs action, or import restriction, all of which are the Customer's responsibility."
      },
      {
        "type": "heading2",
        "text": "8. Indemnification"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, the Customer agrees to indemnify and hold harmless COCOJOJO from any claims, penalties, fines, duties, taxes, costs, and expenses (including reasonable attorneys' fees) arising from the Customer's import, export, marketing, distribution, sale, or use of products outside the United States, or violation of any export-control, sanctions, customs, or foreign regulatory law."
      },
      {
        "type": "heading2",
        "text": "9. Governing Law and Dispute Resolution"
      },
      {
        "type": "paragraph",
        "text": "This Notice is governed by California law and U.S. federal law, and is subject to the dispute-resolution, arbitration, and class-action waiver provisions of the COCOJOJO Terms of Service, incorporated by reference. The United Nations Convention on Contracts for the International Sale of Goods (CISG) does not apply."
      },
      {
        "type": "heading2",
        "text": "10. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "california-proposition-65-notice",
    "title": "California Proposition 65 Notice",
    "footerLabel": "California Proposition 65 Notice",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "California Proposition 65 notice for products and exposures that may require California consumer warnings.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. About Proposition 65"
      },
      {
        "type": "paragraph",
        "text": "The California Safe Drinking Water and Toxic Enforcement Act of 1986, commonly known as \"Proposition 65\" or \"Prop 65,\" requires businesses to provide a clear and reasonable warning before knowingly and intentionally exposing California consumers to chemicals known to the State of California to cause cancer, birth defects, or other reproductive harm. The State maintains a list of approximately 900 such chemicals, updated at least annually."
      },
      {
        "type": "heading2",
        "text": "2. COCOJOJO Warning"
      },
      {
        "type": "table",
        "rows": [
          [
            "WARNING Certain COCO JOJO LLC products can expose you to chemicals including those known to the State of California to cause cancer, birth defects, or other reproductive harm. For more information, go to www.P65Warnings.ca.gov. Where applicable, product-specific Proposition 65 warnings are provided on product packaging, product detail pages, or accompanying documentation. The presence or absence of a warning on a particular product reflects COCOJOJO's assessment of that product."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "3. Naturally Occurring Substances"
      },
      {
        "type": "paragraph",
        "text": "Many COCOJOJO products contain natural, botanical, mineral, clay, and plant-derived ingredients. Naturally occurring trace amounts of chemicals listed under Proposition 65 (for example, trace heavy metals naturally present in clays, minerals, and certain botanicals) may be present even in products that are organic, natural, or otherwise certified. COCOJOJO provides this warning out of an abundance of caution to ensure compliance with California law. A Proposition 65 warning does not necessarily mean a product is unsafe or violates any other safety standard or requirement."
      },
      {
        "type": "heading2",
        "text": "4. Why You May See This Warning"
      },
      {
        "type": "paragraph",
        "text": "California's warning requirement is among the most stringent in the nation and is triggered at exposure levels far below those required by federal safety standards. Businesses often provide Proposition 65 warnings broadly to ensure compliance. The warning is intended to help California consumers make informed decisions."
      },
      {
        "type": "heading2",
        "text": "5. More Information"
      },
      {
        "type": "paragraph",
        "text": "For detailed information about Proposition 65, the list of regulated chemicals, and exposure information, visit the official California Office of Environmental Health Hazard Assessment (OEHHA) website at www.P65Warnings.ca.gov. For product-specific questions, contact COCOJOJO using the information below."
      },
      {
        "type": "heading2",
        "text": "6. No Admission; Reservation of Rights"
      },
      {
        "type": "paragraph",
        "text": "This Notice and any product warning are provided for compliance and precautionary purposes and do not constitute an admission that any product causes or has caused harm, exceeds any exposure threshold, or violates any law. COCOJOJO reserves all rights and defenses available under Proposition 65 and applicable law."
      },
      {
        "type": "heading2",
        "text": "7. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "vendor-supplier-terms",
    "title": "Vendor & Supplier Terms",
    "footerLabel": "Vendor & Supplier Terms",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Terms governing vendors, suppliers, manufacturers, packaging providers, logistics providers, contractors, and other business partners.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. Scope"
      },
      {
        "type": "paragraph",
        "text": "These Vendor & Supplier Terms (\"Vendor Terms\") govern the relationship between COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") and any vendor, supplier, raw-material provider, contract manufacturer, packaging provider, logistics provider, or service provider (\"Vendor,\" \"you,\" or \"your\") that supplies goods or services to COCOJOJO. By accepting a purchase order from COCOJOJO, you agree to these Vendor Terms, which prevail over any conflicting terms in your acknowledgment, invoice, or other documents unless expressly agreed otherwise in a signed writing."
      },
      {
        "type": "heading2",
        "text": "2. Purchase Orders"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO's purchase order is an offer that becomes binding only upon your acceptance or commencement of performance. No order is binding on COCOJOJO unless issued in writing by an authorized representative. COCOJOJO may modify or cancel any order prior to shipment."
      },
      {
        "type": "heading2",
        "text": "3. Quality, Specifications, and Compliance"
      },
      {
        "type": "paragraph",
        "text": "Vendor warrants that all goods and services: (a) conform to COCOJOJO's specifications, samples, and applicable certificates of analysis; (b) are merchantable, fit for their intended purpose, and free from defects; (c) comply with all applicable laws and regulations, including FDA, MoCRA, USDA-NOP (where organic), FTC, OSHA, and applicable international standards; (d) are produced under appropriate Good Manufacturing Practices (GMP) where applicable; and (e) are accurately documented with required SDS, COA, TDS, and origin documentation."
      },
      {
        "type": "heading2",
        "text": "4. Inspection and Rejection"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may inspect, test, and reject non-conforming goods within a reasonable time after receipt. Rejected goods may be returned at Vendor's risk and expense, and COCOJOJO may require replacement, refund, or credit. Payment does not constitute acceptance."
      },
      {
        "type": "heading2",
        "text": "5. Pricing, Invoicing, and Payment"
      },
      {
        "type": "paragraph",
        "text": "Prices are as stated on the purchase order and are firm. Vendor shall invoice accurately; COCOJOJO's standard payment terms apply unless otherwise agreed. COCOJOJO may offset amounts owed by Vendor against any amounts COCOJOJO owes Vendor."
      },
      {
        "type": "heading2",
        "text": "6. Confidentiality and Intellectual Property"
      },
      {
        "type": "table",
        "rows": [
          [
            "CONFIDENTIALITY AND IP OWNERSHIP Vendor shall hold in strict confidence all COCOJOJO formulations, specifications, customer information, business information, and other confidential or proprietary information, and shall use it solely to fulfill orders for COCOJOJO. All formulations, specifications, designs, artwork, tooling, and work product created for or paid for by COCOJOJO are the exclusive property of COCOJOJO. Vendor assigns to COCOJOJO all intellectual property rights in such work product and shall not reproduce, reverse engineer, or supply COCOJOJO formulations or specifications to any third party. These obligations are protected under the Defend Trade Secrets Act (18 U.S.C. Section 1836) and the California Uniform Trade Secrets Act (Cal. Civ. Code Section 3426 et seq.)."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "7. Insurance"
      },
      {
        "type": "paragraph",
        "text": "Vendor shall maintain, at its own expense, commercially appropriate insurance, including commercial general liability and product liability coverage, and shall name COCOJOJO as an additional insured and provide certificates of insurance upon request."
      },
      {
        "type": "heading2",
        "text": "8. Indemnification"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, Vendor shall defend, indemnify, and hold harmless COCOJOJO and its affiliates, officers, directors, employees, and customers from any claims, liabilities, damages, recalls, penalties, costs, and expenses (including reasonable attorneys' fees) arising from: defective or non-conforming goods or services; Vendor's breach of warranty or these Vendor Terms; Vendor's violation of law; intellectual property infringement; or Vendor's negligence or willful misconduct."
      },
      {
        "type": "heading2",
        "text": "9. Recalls"
      },
      {
        "type": "paragraph",
        "text": "If any goods supplied by Vendor are subject to a recall, market withdrawal, or safety action, Vendor shall cooperate fully and bear all reasonable costs of the recall to the extent caused by Vendor's goods or conduct."
      },
      {
        "type": "heading2",
        "text": "10. Compliance with Ethical and Legal Standards"
      },
      {
        "type": "paragraph",
        "text": "Vendor shall comply with all applicable laws regarding labor, anti-slavery and human trafficking (including the California Transparency in Supply Chains Act), anti-bribery and anti-corruption (including the FCPA), environmental protection, and trade and sanctions laws."
      },
      {
        "type": "heading2",
        "text": "11. Term, Termination, and Survival"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may terminate any order or the relationship for convenience or for cause upon notice. Provisions concerning confidentiality, IP, warranties, indemnification, insurance, and dispute resolution survive termination."
      },
      {
        "type": "heading2",
        "text": "12. Limitation of Liability"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, COCOJOJO's liability to Vendor is limited to the amounts payable under the applicable purchase order, and COCOJOJO shall not be liable for indirect, incidental, or consequential damages."
      },
      {
        "type": "heading2",
        "text": "13. Dispute Resolution and Governing Law"
      },
      {
        "type": "paragraph",
        "text": "These Vendor Terms are governed by California law and subject to the dispute-resolution, arbitration, and class-action waiver provisions of the COCOJOJO Terms of Service, incorporated by reference, with exclusive venue in Orange County, California for matters not subject to arbitration."
      },
      {
        "type": "heading2",
        "text": "14. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "copyright-trademark-dmca-reporting-policy",
    "title": "Copyright, Trademark, and DMCA Reporting Policy",
    "footerLabel": "Copyright, Trademark, and DMCA Reporting Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Procedures for reporting copyright, trademark, counterfeit, DMCA, and related intellectual property concerns.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "COPYRIGHT, TRADEMARK,"
      },
      {
        "type": "heading2",
        "text": "1. Our Commitment to Intellectual Property"
      },
      {
        "type": "paragraph",
        "text": "COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") respects the intellectual property rights of others and expects users to do the same. This Copyright, Trademark, and DMCA Reporting Policy explains how to report claimed infringement and how COCOJOJO responds."
      },
      {
        "type": "heading2",
        "text": "2. Designated DMCA Agent"
      },
      {
        "type": "paragraph",
        "text": "In accordance with the Digital Millennium Copyright Act (\"DMCA\"), 17 U.S.C. Section 512(c)(2), COCOJOJO has designated an agent to receive notifications of claimed copyright infringement. COCOJOJO's Designated Agent is registered with the United States Copyright Office, and current contact information is available through the Copyright Office's DMCA Designated Agent Directory at www.copyright.gov/dmca-directory."
      },
      {
        "type": "heading2",
        "text": "3. How to Submit a DMCA Copyright Notice"
      },
      {
        "type": "paragraph",
        "text": "If you believe content on our Services infringes your copyright, send a written notice to our Designated Agent containing all of the following, as required by 17 U.S.C. Section 512(c)(3):"
      },
      {
        "type": "listItem",
        "text": "Identification of the copyrighted work claimed to have been infringed"
      },
      {
        "type": "listItem",
        "text": "Identification of the allegedly infringing material and information reasonably sufficient to locate it (e.g., URL)"
      },
      {
        "type": "listItem",
        "text": "Your full legal name, mailing address, telephone number, and email address"
      },
      {
        "type": "listItem",
        "text": "A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law"
      },
      {
        "type": "listItem",
        "text": "A statement, made under penalty of perjury, that the information is accurate and that you are the copyright owner or authorized to act on the owner's behalf"
      },
      {
        "type": "listItem",
        "text": "Your physical or electronic signature"
      },
      {
        "type": "heading2",
        "text": "4. Counter-Notification"
      },
      {
        "type": "paragraph",
        "text": "If you believe your material was removed or disabled by mistake or misidentification, you may submit a counter-notification under 17 U.S.C. Section 512(g) containing: identification of the removed material and its prior location; your name, address, phone, and email; a statement under penalty of perjury that you have a good-faith belief the material was removed by mistake or misidentification; consent to the jurisdiction of the appropriate federal district court; and your physical or electronic signature."
      },
      {
        "type": "heading2",
        "text": "5. Repeat Infringer Policy"
      },
      {
        "type": "table",
        "rows": [
          [
            "REPEAT INFRINGER TERMINATION In accordance with 17 U.S.C. Section 512(i)(1)(A), COCOJOJO maintains and reasonably implements a policy of terminating, in appropriate circumstances, the accounts, distributorships, reseller relationships, affiliate accounts, or other privileges of any user, customer, distributor, reseller, or affiliate determined to be a repeat infringer of copyright or other intellectual property rights."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "6. Trademark Infringement Reports"
      },
      {
        "type": "paragraph",
        "text": "To report trademark infringement, counterfeiting, or misuse of COCOJOJO marks (or to assert your own marks), send a written notice to support@cocojojo.com with the subject line \"Trademark Notice,\" including: identification of the mark; identification of the allegedly infringing use and its location; your contact information; a good-faith statement; and your signature. COCOJOJO's marks are protected under the Lanham Act (15 U.S.C. SectionSection 1051 et seq.) and California Bus. & Prof. Code Section 14200 et seq. and Section 17200 et seq."
      },
      {
        "type": "heading2",
        "text": "7. False Claims"
      },
      {
        "type": "paragraph",
        "text": "Under 17 U.S.C. Section 512(f), any person who knowingly materially misrepresents that material is infringing, or was removed by mistake, may be liable for damages, including costs and attorneys' fees."
      },
      {
        "type": "heading2",
        "text": "8. COCOJOJO's Response and Reserved Rights"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO will review valid notices and may remove, restrict, or disable access to allegedly infringing content, and may suspend or terminate associated accounts. COCOJOJO reserves all rights and remedies under the Copyright Act, the DMCA, the Lanham Act, the Defend Trade Secrets Act, California unfair-competition law, and other applicable laws, and may seek injunctive relief, statutory and actual damages, costs, and attorneys' fees."
      },
      {
        "type": "heading2",
        "text": "9. Platform Enforcement"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO also utilizes marketplace and platform brand-protection programs, including marketplace service providers Brand Registry, eBay VeRO, Walmart Brand Portal, third-party advertising providers and social media platforms IP portals, YouTube Content ID, and similar tools, to enforce its rights against infringement and counterfeiting."
      },
      {
        "type": "heading2",
        "text": "10. Incorporation and Governing Law"
      },
      {
        "type": "paragraph",
        "text": "This Policy is incorporated into the COCOJOJO Intellectual Property Policy, Terms of Service, and other applicable policies, and is governed by California and U.S. federal law."
      },
      {
        "type": "heading2",
        "text": "11. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "arbitration-dispute-resolution-policy",
    "title": "Arbitration, Class Action Waiver, and Dispute Resolution Policy",
    "footerLabel": "Arbitration, Class Action Waiver, and Dispute Resolution Policy",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "Dispute resolution terms covering informal resolution, arbitration, class action waiver, venue, opt-out rights, and related procedures.",
    "blocks": [
      {
        "type": "paragraph",
        "text": "ARBITRATION, CLASS ACTION WAIVER,"
      },
      {
        "type": "table",
        "rows": [
          [
            "PLEASE READ CAREFULLY - THIS AFFECTS YOUR LEGAL RIGHTS This Policy contains a binding arbitration provision and a class-action and jury-trial waiver. It requires most disputes to be resolved by individual arbitration rather than in court, and waives your right to participate in a class or representative action, except as prohibited by applicable law. Please read it carefully."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "1. Scope"
      },
      {
        "type": "paragraph",
        "text": "This Arbitration, Class Action Waiver, and Dispute Resolution Policy (\"Arbitration Policy\") applies to any dispute, claim, or controversy (\"Dispute\") between you and COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") arising out of or relating to any product, service, transaction, communication, or COCOJOJO policy, whether based in contract, tort, statute, fraud, or any other theory. It is incorporated into all COCOJOJO policies and agreements."
      },
      {
        "type": "heading2",
        "text": "2. Informal Resolution First"
      },
      {
        "type": "paragraph",
        "text": "Before initiating arbitration, you agree to first contact COCOJOJO at support@cocojojo.com and provide a written description of the Dispute and the relief sought. The parties will attempt in good faith to resolve the Dispute informally for at least sixty (60) days. This informal-resolution requirement is a condition precedent to commencing arbitration."
      },
      {
        "type": "heading2",
        "text": "3. Binding Arbitration"
      },
      {
        "type": "paragraph",
        "text": "If the Dispute is not resolved informally, it shall be resolved by final and binding individual arbitration administered by a recognized arbitration provider (such as the American Arbitration Association (AAA) or JAMS) under its applicable consumer or commercial rules then in effect, except as modified by this Arbitration Policy. The Federal Arbitration Act (9 U.S.C. SectionSection 1 et seq.) governs the interpretation and enforcement of this provision."
      },
      {
        "type": "heading2",
        "text": "4. Class Action and Representative Action Waiver"
      },
      {
        "type": "table",
        "rows": [
          [
            "CLASS ACTION WAIVER TO THE FULLEST EXTENT PERMITTED BY LAW, ALL DISPUTES SHALL BE ARBITRATED OR LITIGATED ON AN INDIVIDUAL BASIS ONLY. YOU AND COCOJOJO WAIVE ANY RIGHT TO BRING OR PARTICIPATE IN A CLASS ACTION, COLLECTIVE ACTION, CONSOLIDATED ACTION, OR PRIVATE ATTORNEY GENERAL ACTION. THE ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS OR PRESIDE OVER ANY FORM OF REPRESENTATIVE PROCEEDING. IF THIS WAIVER IS FOUND UNENFORCEABLE AS TO A PARTICULAR CLAIM, THAT CLAIM SHALL PROCEED IN COURT, BUT THE REMAINDER SHALL REMAIN IN ARBITRATION."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "5. Jury Trial Waiver"
      },
      {
        "type": "paragraph",
        "text": "To the fullest extent permitted by law, you and COCOJOJO waive any right to a trial by jury for any Dispute."
      },
      {
        "type": "heading2",
        "text": "6. Exceptions to Arbitration"
      },
      {
        "type": "paragraph",
        "text": "Notwithstanding the above, either party may: (a) bring an individual claim in small-claims court if it qualifies; (b) seek injunctive or equitable relief in court to protect intellectual property or confidential information; and (c) pursue any remedy that, by law, cannot be waived or compelled to arbitration. Nothing in this Arbitration Policy prevents you from filing a complaint with a government agency, including the California Privacy Protection Agency, the California Attorney General, or the FTC."
      },
      {
        "type": "heading2",
        "text": "7. Arbitration Procedures and Costs"
      },
      {
        "type": "paragraph",
        "text": "The arbitration shall be conducted by a single neutral arbitrator. The seat of arbitration shall be Orange County, California, unless applicable law requires otherwise or the parties agree to a different location or to a documents-only or telephonic proceeding. Each party bears its own attorneys' fees except where a statute or the arbitrator provides otherwise. Allocation of arbitration fees is governed by the administering provider's consumer rules; where those rules require COCOJOJO to bear certain consumer arbitration costs, COCOJOJO will do so as required."
      },
      {
        "type": "heading2",
        "text": "8. Opt-Out Right"
      },
      {
        "type": "paragraph",
        "text": "You may opt out of this Arbitration Policy by sending written notice to support@cocojojo.com within thirty (30) days of first accepting it, stating your name and intent to opt out of arbitration. Opting out does not affect any other provision of the COCOJOJO policies. If you opt out, Disputes will be resolved in the courts identified below."
      },
      {
        "type": "heading2",
        "text": "9. Governing Law and Venue"
      },
      {
        "type": "paragraph",
        "text": "This Arbitration Policy and any Dispute are governed by California law and the Federal Arbitration Act, without regard to conflict-of-laws principles. For any Dispute not subject to arbitration, the exclusive venue shall be the state and federal courts located in Orange County, California, and you consent to personal jurisdiction there."
      },
      {
        "type": "heading2",
        "text": "10. Survival and Severability"
      },
      {
        "type": "paragraph",
        "text": "This Arbitration Policy survives termination of any relationship with COCOJOJO. If any portion (other than the class-action waiver, governed by Section 4) is found unenforceable, it shall be severed and the remainder shall continue in full force."
      },
      {
        "type": "heading2",
        "text": "11. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "cookie-banner-consent-notice",
    "title": "Cookie Banner & Consent Notice",
    "footerLabel": "Cookie Banner & Consent Notice",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "How COCOJOJO presents cookie choices, records consent, and lets visitors manage required and optional cookie preferences.",
    "blocks": [
      {
        "type": "heading2",
        "text": "1. Purpose"
      },
      {
        "type": "paragraph",
        "text": "This Cookie Banner & Consent Notice describes how COCO JOJO LLC (\"COCOJOJO,\" \"Company,\" \"we,\" \"us,\" or \"our\") presents cookie choices and records consent. It supplements the COCOJOJO Cookie Policy, which contains full details on the categories of cookies and tracking technologies we use."
      },
      {
        "type": "heading2",
        "text": "2. Tracking Technologies We Use"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may use cookies, pixels, tags, scripts, SDKs, local storage, analytics tools, advertising technologies, session replay tools, heat-mapping tools, and similar tracking technologies for security, functionality, analytics, advertising, personalization, and business operations."
      },
      {
        "type": "heading2",
        "text": "3. The Cookie Banner"
      },
      {
        "type": "paragraph",
        "text": "Where required by law, users may be presented with a cookie banner or consent-preference tool that allows them to:"
      },
      {
        "type": "listItem",
        "text": "Accept all cookies"
      },
      {
        "type": "listItem",
        "text": "Reject all non-essential cookies"
      },
      {
        "type": "listItem",
        "text": "Customize cookie preferences by category"
      },
      {
        "type": "listItem",
        "text": "Manage analytics cookies"
      },
      {
        "type": "listItem",
        "text": "Manage advertising and retargeting cookies"
      },
      {
        "type": "listItem",
        "text": "Manage functional cookies"
      },
      {
        "type": "listItem",
        "text": "Manage session replay and user-experience tools"
      },
      {
        "type": "paragraph",
        "text": "Non-essential cookies may include analytics, advertising, retargeting, remarketing, personalization, session replay, and similar technologies. Strictly necessary cookies, required for core site functionality and security, operate without consent."
      },
      {
        "type": "heading2",
        "text": "4. Consent Handling"
      },
      {
        "type": "paragraph",
        "text": "Where legally required, COCOJOJO blocks or limits non-essential cookies until the user provides consent. For California residents, COCOJOJO honors the Global Privacy Control (GPC) signal as a valid opt-out of the sale and sharing of personal information. Consent choices may be stored using cookies or similar technologies; if a user clears cookies, changes browsers, uses another device, or uses privacy tools, the user may need to reset preferences."
      },
      {
        "type": "heading2",
        "text": "5. Consent Records"
      },
      {
        "type": "table",
        "rows": [
          [
            "CONSENT LOGGING Where permitted by law, COCOJOJO may maintain consent logs that record information such as the timestamp, browser, device, IP address, consent selections, preference changes, the version of the banner or notice displayed, and related technical data. These records are retained to demonstrate compliance with applicable consent requirements and may be used for legal, compliance, audit, and evidentiary purposes."
          ]
        ]
      },
      {
        "type": "heading2",
        "text": "6. Changing Your Preferences"
      },
      {
        "type": "paragraph",
        "text": "Users may change their cookie preferences at any time through the cookie-preference tool on our website, by adjusting browser settings, by using industry opt-out tools, or by contacting support@cocojojo.com. Disabling certain cookies may affect site functionality, personalization, and advertising relevance."
      },
      {
        "type": "heading2",
        "text": "7. Incorporation and Governing Law"
      },
      {
        "type": "paragraph",
        "text": "This Notice is incorporated into and subject to the COCOJOJO Cookie Policy, Privacy Policy, and Terms of Service, and is governed by California law."
      },
      {
        "type": "heading2",
        "text": "8. Contact Information"
      },
      {
        "type": "table",
        "rows": [
          [
            "Company",
            "COCO JOJO LLC"
          ],
          [
            "Email",
            "support@cocojojo.com"
          ],
          [
            "Mailing Address",
            ""
          ],
          [
            "Website",
            "www.COCOJOJO.com"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "2026 COCO JOJO LLC. All rights reserved."
      }
    ]
  },
  {
    "slug": "website-acceptance-checkbox-logging-notice",
    "title": "Website Acceptance & Checkbox Logging Notice",
    "footerLabel": "Website Acceptance & Checkbox Logging Notice",
    "effectiveDate": "May 27, 2026",
    "lastUpdated": "May 27, 2026",
    "summary": "This notice explains how COCOJOJO presents acceptance language and may record checkbox, consent, and policy acceptance events for compliance, security, and recordkeeping.",
    "blocks": [
      {
        "type": "heading2",
        "text": "Purpose"
      },
      {
        "type": "paragraph",
        "text": "This Website Acceptance & Checkbox Logging Notice explains how COCO JOJO LLC presents legal acceptance language and may record acceptance, consent, acknowledgment, and checkbox events across COCOJOJO websites, checkout flows, account registration, wholesale inquiry flows, subscription tools, cookie preference tools, and related digital services."
      },
      {
        "type": "heading2",
        "text": "Acceptance Events We May Record"
      },
      {
        "type": "listItem",
        "text": "Acceptance of Terms of Service, Privacy Policy, Cookie Policy, and related legal notices."
      },
      {
        "type": "listItem",
        "text": "Checkout acknowledgments, order confirmations, subscription confirmations, wholesale inquiry acknowledgments, and account creation acknowledgments."
      },
      {
        "type": "listItem",
        "text": "Cookie consent choices, preference changes, opt-outs, and do-not-sell-or-share requests where applicable."
      },
      {
        "type": "heading2",
        "text": "Information Associated With Acceptance Logs"
      },
      {
        "type": "paragraph",
        "text": "Records may include the date and time of the event, policy version, acceptance language shown, page or workflow, browser and device information, IP-derived technical information, account or order identifiers, and other information reasonably necessary to document consent, security, compliance, and dispute resolution."
      },
      {
        "type": "heading2",
        "text": "Why We Keep These Records"
      },
      {
        "type": "paragraph",
        "text": "COCOJOJO may retain acceptance records to demonstrate policy acceptance, process transactions, prevent fraud, honor privacy choices, comply with legal obligations, support security reviews, respond to disputes, and maintain accurate business records."
      },
      {
        "type": "heading2",
        "text": "Questions"
      },
      {
        "type": "paragraph",
        "text": "For questions about website acceptance records or consent choices, contact support@cocojojo.com."
      }
    ]
  }
] satisfies LegalPolicy[];

export const getLegalPolicy = (slug: string) =>
  legalPolicies.find((policy) => policy.slug === slug);
