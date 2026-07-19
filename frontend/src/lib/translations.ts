export type Language = 'en' | 'hi' | 'mr';

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
};

const translations = {
  en: {
    // Navbar
    navProduct: 'Product',
    navMarketplace: 'Marketplace',
    navPricing: 'Pricing',
    navHowItWorks: 'How It Works',
    navFAQ: 'FAQ',
    navLogin: 'Log In',
    navGetStarted: 'Get Started',

    // Hero
    heroBadge: 'Trusted by 10,000+ Farmers',
    heroTitle1: 'Empowering Farmers Through',
    heroTitle2: 'AI & Direct Access',
    heroDesc: 'A unified ecosystem bringing real-time auctions, smart logistics, AI crop advisory, and institutional credit directly to your farm.',
    heroJoinFarmer: 'Join as Farmer',
    heroExploreMarket: 'Explore Marketplace',

    // Hero Cards
    heroLiveAuction: 'Live Auction',
    heroLIVE: 'LIVE',
    heroHighestBid: 'Current Highest Bid',
    heroKrishiSathi: 'KrishiSathi AI',
    heroCropAdvisory: 'Crop Advisory Active',
    heroTomatoTip: '"Tomato prices are trending 12% higher this week in your district. Good time to list!"',
    heroTrustScore: 'Trust Score',
    heroExcellentTier: 'Excellent Tier',

    // Stats
    statFarmers: 'Farmers Onboarded',
    statCrops: 'Crops Sold (Tons)',
    statValue: 'Value Transacted',
    statLoans: 'Loans Disbursed',

    // Features
    featuresTitle: 'A Complete',
    featuresTitleGradient: 'Agri-Ecosystem',
    featuresDesc: 'Everything you need to sell smarter, deliver faster, and grow your agricultural business securely.',
    feature1Title: 'Live Auctions',
    feature1Desc: 'Bypass middlemen and sell your harvest through real-time bidding to verified buyers.',
    feature2Title: 'Smart Logistics',
    feature2Desc: 'Optimize multi-farmer pickup routes and share truck costs transparently.',
    feature3Title: 'KrishiSathi AI',
    feature3Desc: 'Get instant crop advisory, disease detection, and price predictions in your local language.',
    feature4Title: 'AgriCredit Scoring',
    feature4Desc: 'Build a trustworthy credit profile based on your transaction history to access institutional loans.',
    feature5Title: 'Direct Marketplace',
    feature5Desc: 'A nationwide platform connecting farmers and bulk buyers securely and transparently.',
    feature6Title: 'Multilingual Voice AI',
    feature6Desc: 'Interact with the platform using simple voice commands in English, Hindi, and Marathi.',

    // How It Works
    howBadge: 'Simple & Secure',
    howTitle: 'How AgriBridge Works',
    howDesc: 'Our end-to-end system streamlines trade, ensures instant payment, and optimizes delivery.',
    howStep1: 'Onboard & Verify',
    howStep1Desc: 'Sign up as a Farmer, Buyer, Bank, or Logistics partner and quickly verify your KYC.',
    howStep2: 'List or Bid',
    howStep2Desc: 'Farmers list harvests directly; buyers can buy immediately or bid in live auctions.',
    howStep3: 'Escrow Payment',
    howStep3Desc: 'Buyers pay into a secure escrow system. Funds are locked safely.',
    howStep4: 'Smart Delivery',
    howStep4Desc: 'Nearby pick-ups are routed dynamically, delivering crops and releasing funds.',

    // Marketplace Preview
    marketBadge: 'Marketplace Preview',
    marketTitle: 'Explore Available Crops',
    marketBrowse: 'Browse Marketplace',
    marketFarmer: 'Farmer',
    marketOrganic: 'Organic',

    // Auction Preview
    auctionBadge: 'Live Auctions',
    auctionTitle: 'Real-Time Competitive Bidding',
    auctionDesc: 'Our Redis-backed lock system ensures bids are updated instantly. Farmers get maximum crop value; buyers get absolute transparency.',
    auctionCurrentBid: 'Current Highest Bid',
    auctionTotalBids: 'Total Bids Placed',
    auctionEnds: 'Ends in',

    // AI Preview
    aiBadge: 'AI Advisory',
    aiTitle: 'Chat with KrishiSathi AI',
    aiDesc: 'Get direct access to agronomy advice, pest remedies, and regional price alerts.',
    aiOnline: 'Online',

    // Pricing
    pricingBadge: 'Pricing Plans',
    pricingTitle: 'Transparent Commission',
    pricingDesc: 'No hidden fees. We align our growth directly with your agricultural trade success.',
    pricingFarmers: 'For Farmers',
    pricingFarmersDesc: 'Access buyers directly with zero listing fees.',
    pricingFarmersFee: '1%',
    pricingFarmersFeeDesc: 'flat fee per sale',
    pricingFarmers1: 'Free Crop Listings',
    pricingFarmers2: 'Free Live Auctions',
    pricingFarmers3: 'Multilingual AI Assistant',
    pricingFarmers4: 'Trust Profile Setup',
    pricingFarmersBtn: 'Get Started as Farmer',
    pricingBuyers: 'For Bulk Buyers',
    pricingBuyersDesc: 'Bid on live auctions and source verified crops directly.',
    pricingBuyersFee: '1%',
    pricingBuyersFeeDesc: 'take-rate + shipping',
    pricingBuyers1: 'Real-time Bidding Room',
    pricingBuyers2: 'Escrow Secure Checkout',
    pricingBuyers3: 'Quality Grade Inspection Reports',
    pricingBuyers4: 'Route Optimized Freight Delivery',
    pricingBuyersBtn: 'Get Started as Buyer',

    // Testimonials
    testimonialsBadge: 'Success Stories',
    testimonialsTitle: 'Empowering Real People',

    // FAQ
    faqBadge: 'Got Questions?',
    faqTitle: 'Frequently Asked Questions',

    // Contact
    contactBadge: 'Get In Touch',
    contactTitle: 'Partner with AgriBridge',
    contactDesc: 'Have questions about custom institutional solutions or API access? Connect with our dedicated support team.',
    contactName: 'Your Name',
    contactEmail: 'Email Address',
    contactMsg: 'Your Message...',
    contactBtn: 'Send Inquiry',

    // Footer
    footerDesc: 'Empowering Indian farmers through real-time marketplace bidding, route-optimized logistics, and friction-free banking.',
    footerPlatform: 'Platform',
    footerResources: 'Resources',
    footerNewsletter: 'Newsletter',
    footerNewsletterDesc: 'Subscribe to receive market price trends.',
    footerEmail: 'Email Address',
    footerJoin: 'Join',
    footerRights: '© 2026 AgriBridge. All rights reserved.',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerFAQs: 'FAQs',
    footerHowItWorks: 'How It Works',

    // Language Settings
    langSettings: 'Language',
    langSettingsDesc: 'Choose your preferred language for the entire application.',
    langLabel: 'Preferred Language',
    langSelect: 'Select language',
    langSaved: 'Language preference saved!',
  },
  hi: {
    // Navbar
    navProduct: 'उत्पाद',
    navMarketplace: 'बाज़ार',
    navPricing: 'मूल्य निर्धारण',
    navHowItWorks: 'यह कैसे काम करता है',
    navFAQ: 'सामान्य प्रश्न',
    navLogin: 'लॉग इन',
    navGetStarted: 'शुरू करें',

    // Hero
    heroBadge: '10,000+ किसानों द्वारा विश्वसनीय',
    heroTitle1: 'AI और प्रत्यक्ष पहुँच के माध्यम से किसानों को सशक्त बनाना',
    heroTitle2: '',
    heroDesc: 'रीयल-टाइम नीलामी, स्मार्ट लॉजिस्टिक्स, AI फसल सलाह और संस्थागत ऋण को सीधे आपके खेत तक लाने वाला एक एकीकृत पारिस्थितिकी तंत्र।',
    heroJoinFarmer: 'किसान के रूप में जुड़ें',
    heroExploreMarket: 'बाज़ार देखें',

    // Hero Cards
    heroLiveAuction: 'लाइव नीलामी',
    heroLIVE: 'लाइव',
    heroHighestBid: 'वर्तमान सर्वोच्च बोली',
    heroKrishiSathi: 'कृषिसार्थी AI',
    heroCropAdvisory: 'फसल सलाह सक्रिय',
    heroTomatoTip: '"इस सप्ताह आपके जिले में टमाटर की कीमतें 12% अधिक बढ़ रही हैं। सूचीबद्ध करने का अच्छा समय है!"',
    heroTrustScore: 'विश्वास स्कोर',
    heroExcellentTier: 'उत्कृष्ट श्रेणी',

    // Stats
    statFarmers: 'किसान पंजीकृत',
    statCrops: 'फसलें बिकी (टन)',
    statValue: 'कुल लेनदेन मूल्य',
    statLoans: 'ऋण वितरित',

    // Features
    featuresTitle: 'एक सम्पूर्ण',
    featuresTitleGradient: 'कृषि पारिस्थितिकी तंत्र',
    featuresDesc: 'स्मार्ट रूप से बेचने, तेजी से डिलीवरी करने और अपने कृषि व्यवसाय को सुरक्षित रूप से बढ़ाने के लिए आपको जो कुछ भी चाहिए।',
    feature1Title: 'लाइव नीलामी',
    feature1Desc: 'बिचौलियों को दरकिनार करें और सत्यापित खरीदारों को रीयल-टाइम बोली के माध्यम से अपनी फसल बेचें।',
    feature2Title: 'स्मार्ट लॉजिस्टिक्स',
    feature2Desc: 'बहु-किसान पिकअप मार्गों को अनुकूलित करें और ट्रक लागत को पारदर्शी रूप से साझा करें।',
    feature3Title: 'कृषिसार्थी AI',
    feature3Desc: 'अपनी स्थानीय भाषा में तत्काल फसल सलाह, रोग पहचान और मूल्य भविष्यवाणियां प्राप्त करें।',
    feature4Title: 'कृषि क्रेडिट स्कोरिंग',
    feature4Desc: 'संस्थागत ऋन तक पहुंचने के लिए अपने लेनदेन इतिहास के आधार पर एक विश्वसनीय क्रेडिट प्रोफ़ाइल बनाएं।',
    feature5Title: 'प्रत्यक्ष बाज़ार',
    feature5Desc: 'किसानों और थोक खरीदारों को सुरक्षित और पारदर्शी रूप से जोड़ने वाला एक राष्ट्रव्यापी मंच।',
    feature6Title: 'बहुभाषी वॉइस AI',
    feature6Desc: 'अंग्रेजी, हिंदी और मराठी में सरल आवाज कमांड का उपयोग करके प्लेटफ़ॉर्म के साथ बातचीत करें।',

    // How It Works
    howBadge: 'सरल और सुरक्षित',
    howTitle: 'AgriBridge कैसे काम करता है',
    howDesc: 'हमारा एंड-टू-एंड सिस्टम व्यापार को सुव्यवस्थित करता है, तत्काल भुगतान सुनिश्चित करता है और डिलीवरी को अनुकूलित करता है।',
    howStep1: 'पंजीकरण और सत्यापन',
    howStep1Desc: 'किसान, खरीदार, बैंक या लॉजिस्टिक्स पार्टनर के रूप में साइन अप करें और जल्दी अपना KYC सत्यापित करें।',
    howStep2: 'सूची या बोली',
    howStep2Desc: 'किसान सीधे फसल सूचीबद्ध करते हैं; खरीदार तुरंत खरीद सकते हैं या लाइव नीलामी में बोली लगा सकते हैं।',
    howStep3: 'एस्क्रो भुगतान',
    howStep3Desc: 'खरीदार एक सुरक्षित एस्क्रो सिस्टम में भुगतान करते हैं। फंड सुरक्षित रूप से लॉक हो जाते हैं।',
    howStep4: 'स्मार्ट डिलीवरी',
    howStep4Desc: 'निकटतम पिकअप को गतिशील रूप से रूट किया जाता है, फसलों की डिलीवरी करते हुए और फंड जारी करते हुए।',

    // Marketplace Preview
    marketBadge: 'बाज़ार पूर्वावलोकन',
    marketTitle: 'उपलब्ध फसलें देखें',
    marketBrowse: 'बाज़ार देखें',
    marketFarmer: 'किसान',
    marketOrganic: 'जैविक',

    // Auction Preview
    auctionBadge: 'लाइव नीलामी',
    auctionTitle: 'रीयल-टाइम प्रतिस्पर्धी बोली',
    auctionDesc: 'हमारा Redis-संचालित लॉक सिस्टम सुनिश्चित करता है कि बोलियां तुरंत अपडेट हों। किसानों को अधिकतम फसल मूल्य मिलता है; खरीदारों को पूर्ण पारदर्शिता मिलती है।',
    auctionCurrentBid: 'वर्तमान सर्वोच्च बोली',
    auctionTotalBids: 'कुल बोलियां',
    auctionEnds: 'समाप्ति',

    // AI Preview
    aiBadge: 'AI सलाह',
    aiTitle: 'कृषिसार्थी AI से चैट करें',
    aiDesc: 'कृषि सलाह, कीट उपचार और क्षेत्रीय मूल्य अलर्ट तक सीधी पहुंच प्राप्त करें।',
    aiOnline: 'ऑनलाइन',

    // Pricing
    pricingBadge: 'मूल्य योजनाएं',
    pricingTitle: 'पारदर्शी कमीशन',
    pricingDesc: 'कोई छिपी हुई फीस नहीं। हम अपनी वृद्धि को सीधे आपकी कृषि व्यापार सफलता के साथ जोड़ते हैं।',
    pricingFarmers: 'किसानों के लिए',
    pricingFarmersDesc: 'शून्य लिस्टिंग शुल्क के साथ सीधे खरीदारों तक पहुंचें।',
    pricingFarmersFee: '1%',
    pricingFarmersFeeDesc: 'प्रति बिक्री फ्लैट शुल्क',
    pricingFarmers1: 'मुफ्त फसल लिस्टिंग',
    pricingFarmers2: 'मुफ्त लाइव नीलामी',
    pricingFarmers3: 'बहुभाषी AI सहायक',
    pricingFarmers4: 'ट्रस्ट प्रोफ़ाइल सेटअप',
    pricingFarmersBtn: 'किसान के रूप में शुरू करें',
    pricingBuyers: 'थोक खरीदारों के लिए',
    pricingBuyersDesc: 'लाइव नीलामी में बोली लगाएं और सीधे सत्यापित फसलें प्राप्त करें।',
    pricingBuyersFee: '1%',
    pricingBuyersFeeDesc: 'टेक-रेट + शिपिंग',
    pricingBuyers1: 'रीयल-टाइम बोली कक्ष',
    pricingBuyers2: 'एस्क्रो सुरक्षित चेकआउट',
    pricingBuyers3: 'ग्रेड गुणवत्ता निरीक्षण रिपोर्ट',
    pricingBuyers4: 'रूट अनुकूलित फ्रेट डिलीवरी',
    pricingBuyersBtn: 'खरीदार के रूप में शुरू करें',

    // Testimonials
    testimonialsBadge: 'सफलता की कहानियां',
    testimonialsTitle: 'वास्तविक लोगों को सशक्त बनाना',

    // FAQ
    faqBadge: 'सवाल हैं?',
    faqTitle: 'अक्सर पूछे जाने वाले सवाल',

    // Contact
    contactBadge: 'संपर्क करें',
    contactTitle: 'AgriBridge के साथ साझेदारी करें',
    contactDesc: 'कस्टम संस्थागत समाधान या API पहुंच के बारे में प्रश्न हैं? हमारी समर्पित सहायता टीम से जुड़ें।',
    contactName: 'आपका नाम',
    contactEmail: 'ईमेल पता',
    contactMsg: 'आपका संदेश...',
    contactBtn: 'पूछताछ भेजें',

    // Footer
    footerDesc: 'रीयल-टाइम बाज़ार बोली, रूट-अनुकूलित लॉजिस्टिक्स और घर्षण-मुक्त बैंकिंग के माध्यम से भारतीय किसानों को सशक्त बनाना।',
    footerPlatform: 'प्लेटफ़ॉर्म',
    footerResources: 'संसाधन',
    footerNewsletter: 'न्यूज़लेटर',
    footerNewsletterDesc: 'बाज़ार मूल्य रुझान प्राप्त करने के लिए सदस्यता लें।',
    footerEmail: 'ईमेल पता',
    footerJoin: 'जुड़ें',
    footerRights: '© 2026 AgriBridge। सर्वाधिकार सुरक्षित।',
    footerPrivacy: 'गोपनीयता नीति',
    footerTerms: 'सेवा की शर्तें',
    footerFAQs: 'सामान्य प्रश्न',
    footerHowItWorks: 'यह कैसे काम करता है',

    // Language Settings
    langSettings: 'भाषा',
    langSettingsDesc: 'पूरे अनुप्रयोग के लिए अपनी पसंदीदा भाषा चुनें।',
    langLabel: 'पसंदीदा भाषा',
    langSelect: 'भाषा चुनें',
    langSaved: 'भाषा प्राथमिकता सहेजी गई!',
  },
  mr: {
    // Navbar
    navProduct: 'उत्पादन',
    navMarketplace: 'बाजार',
    navPricing: 'किंमत',
    navHowItWorks: 'हे कसे काम करते',
    navFAQ: 'वारंवार विचारले जाणारे प्रश्न',
    navLogin: 'लॉग इन',
    navGetStarted: 'सुरू करा',

    // Hero
    heroBadge: '10,000+ शेतकऱ्यांद्वारा विश्वासार्ह',
    heroTitle1: 'AI आणि थेट प्रवेशाद्वारे शेतकऱ्यांना सक्षम करणे',
    heroTitle2: '',
    heroDesc: 'रीअल-टाइम लिलाव, स्मार्ट लॉजिस्टिक्स, AI पीक सल्ला आणि संस्थागत कर्ज थेट तुमच्या शेतापर्यंत आणणारे एक एकीकृत इकोसिस्टम.',
    heroJoinFarmer: 'शेतकरी म्हणून सामील व्हा',
    heroExploreMarket: 'बाजार पहा',

    // Hero Cards
    heroLiveAuction: 'लाइव्ह लिलाव',
    heroLIVE: 'लाइव्ह',
    heroHighestBid: 'सध्याची सर्वोच्च बोली',
    heroKrishiSathi: 'कृषिसार्थी AI',
    heroCropAdvisory: 'पीक सल्ला सक्रिय',
    heroTomatoTip: '"या आठवड्यात तुमच्या जिल्ह्यात टोमॅटोच्या किंमती 12% अधिक वाढत आहेत. यादी टाकण्याचा चांगला वेळ!"',
    heroTrustScore: 'विश्वास स्कोअर',
    heroExcellentTier: 'उत्कृष्ट श्रेणी',

    // Stats
    statFarmers: 'शेतकरी नोंदणीकृत',
    statCrops: 'पिके विकली (टन)',
    statValue: 'एकूण व्यवहार मूल्य',
    statLoans: 'कर्ज वितरित',

    // Features
    featuresTitle: 'एक संपूर्ण',
    featuresTitleGradient: 'कृषी इकोसिस्टम',
    featuresDesc: 'हुशारपणे विकण्यासाठी, जलद डिलिव्हरी करण्यासाठी आणि तुमचा शेती व्यवसाय सुरक्षितपणे वाढवण्यासाठी तुम्हाला जे काही हवे आहे.',
    feature1Title: 'लाइव्ह लिलाव',
    feature1Desc: 'दलालांना टाळा आणि प्रमाणित खरेदीदारांना रीअल-टाइम बोलीद्वारे तुमचे पीक विका.',
    feature2Title: 'स्मार्ट लॉजिस्टिक्स',
    feature2Desc: 'बहु-शेतकरी पिकअप मार्ग अनुकूलित करा आणि ट्रक खर्च पारदर्शकपणे वाटा.',
    feature3Title: 'कृषिसार्थी AI',
    feature3Desc: 'तुमच्या स्थानिक भेषणात तात्काळ पीक सल्ला, रोग ओळख आणि किंमत अंदाज मिळवा.',
    feature4Title: 'कृषी क्रेडिट स्कोअरिंग',
    feature4Desc: 'संस्थागत कर्ज मिळवण्यासाठी तुमच्या व्यवहार इतिहासावर आधारित विश्वासार्ह क्रेडिट प्रोफाइल तयार करा.',
    feature5Title: 'थेट बाजार',
    feature5Desc: 'शेतकरी आणि थोक खरेदीदारांना सुरक्षित आणि पारदर्शकपणे जोडणारे एक राष्ट्रव्यापी व्यासपीठ.',
    feature6Title: 'बहुभाषी व्हॉइस AI',
    feature6Desc: 'इंग्रजी, हिंदी आणि मराठीत सोप्या आवाज आदेशांचा वापर करून व्यासपीठाशी संवाद साधा.',

    // How It Works
    howBadge: 'सोपे आणि सुरक्षित',
    howTitle: 'AgriBridge कसे काम करते',
    howDesc: 'आमची एंड-टू-एंड सिस्टम व्यापार सुव्यवस्थित करते, तात्काळ पेमेंट सुनिश्चित करते आणि डिलिव्हरी अनुकूलित करते.',
    howStep1: 'नोंदणी आणि पडताळणी',
    howStep1Desc: 'शेतकरी, खरेदीदार, बँक किंवा लॉजिस्टिक्स भागीदार म्हणून साइन अप करा आणि जलद तुमचे KYC पडताळा.',
    howStep2: 'यादी किंवा बोली',
    howStep2Desc: 'शेतकरी थेट पिकांची यादी करतात; खरेदीदार लगेच खरेदी करू शकतात किंवा लाइव्ह लिलावात बोली लावू शकतात.',
    howStep3: 'एस्क्रो पेमेंट',
    howStep3Desc: 'खरेदीदार सुरक्षित एस्क्रो सिस्टममध्ये पेमेंट करतात. निधी सुरक्षितपणे लॉक होतात.',
    howStep4: 'स्मार्ट डिलिव्हरी',
    howStep4Desc: 'जवळच्या पिकअपला गतिशीलपणे मार्गदर्शित केले जाते, पिके डिलिव्हर करताना आणि निधी सोडताना.',

    // Marketplace Preview
    marketBadge: 'बाजार पूर्वावलोकन',
    marketTitle: 'उपलब्ध पिके पहा',
    marketBrowse: 'बाजार पहा',
    marketFarmer: 'शेतकरी',
    marketOrganic: 'सेंद्रिय',

    // Auction Preview
    auctionBadge: 'लाइव्ह लिलाव',
    auctionTitle: 'रीअल-टाइम स्पर्धात्मक बोली',
    auctionDesc: 'आमची Redis-समर्थित लॉक सिस्टम सुनिश्चित करते की बोली तात्काळ अपडेट होतात. शेतकऱ्यांना जास्तीत जास्त पीक किंमत मिळते; खरेदीदारांना पूर्ण पारदर्शकता मिळते.',
    auctionCurrentBid: 'सध्याची सर्वोच्च बोली',
    auctionTotalBids: 'एकूण बोली',
    auctionEnds: 'समाप्ती',

    // AI Preview
    aiBadge: 'AI सल्ला',
    aiTitle: 'कृषिसार्थी AI शी चॅट करा',
    aiDesc: 'शेती सल्ला, कीड उपचार आणि प्रादेशिक किंमत सूचनांमध्ये थेट प्रवेश मिळवा.',
    aiOnline: 'ऑनलाइन',

    // Pricing
    pricingBadge: 'किंमत योजना',
    pricingTitle: 'पारदर्शक कमिशन',
    pricingDesc: 'कोणताही लपलेला शुल्क नाही. आम्ही आमच्या वाढीला थेट तुमच्या शेती व्यवसाय यशाशी जोडतो.',
    pricingFarmers: 'शेतकऱ्यांसाठी',
    pricingFarmersDesc: 'शून्य यादी शुल्कासह थेट खरेदीदारांपर्यंत पोहोचा.',
    pricingFarmersFee: '1%',
    pricingFarmersFeeDesc: 'प्रति विक्री फ्लॅट शुल्क',
    pricingFarmers1: 'मोफत पीक यादी',
    pricingFarmers2: 'मोफत लाइव्ह लिलाव',
    pricingFarmers3: 'बहुभाषी AI सहाय्यक',
    pricingFarmers4: 'ट्रस्ट प्रोफाइल सेटअप',
    pricingFarmersBtn: 'शेतकरी म्हणून सुरू करा',
    pricingBuyers: 'थोक खरेदीदारांसाठी',
    pricingBuyersDesc: 'लाइव्ह लिलावात बोली लावा आणि थेट प्रमाणित पिके मिळवा.',
    pricingBuyersFee: '1%',
    pricingBuyersFeeDesc: 'टेक-रेट + शिपिंग',
    pricingBuyers1: 'रीअल-टाइम बोली खोली',
    pricingBuyers2: 'एस्क्रो सुरक्षित चेकआउट',
    pricingBuyers3: 'ग्रेड गुणवत्ता तपासणी अहवाल',
    pricingBuyers4: 'मार्ग अनुकूलित फ्रेट डिलिव्हरी',
    pricingBuyersBtn: 'खरेदीदार म्हणून सुरू करा',

    // Testimonials
    testimonialsBadge: 'यशोगाथा',
    testimonialsTitle: 'खरोखर लोकांना सक्षम करणे',

    // FAQ
    faqBadge: 'प्रश्न आहेत?',
    faqTitle: 'वारंवार विचारले जाणारे प्रश्न',

    // Contact
    contactBadge: 'संपर्क करा',
    contactTitle: 'AgriBridge शी भागीदारी करा',
    contactDesc: 'सानुकूल संस्थागत उपाय किंवा API प्रवेशाबद्दल प्रश्न आहेत? आमच्या समर्पित सहाय्यता टीमशी कनेक्ट व्हा.',
    contactName: 'तुमचे नाव',
    contactEmail: 'ईमेल पत्ता',
    contactMsg: 'तुमचा संदेश...',
    contactBtn: 'चौकशी पाठवा',

    // Footer
    footerDesc: 'रीअल-टाइम बाजार बोली, मार्ग-अनुकूलित लॉजिस्टिक्स आणि घर्षण-मुक्त बँकिंगद्वारे भारतीय शेतकऱ्यांना सक्षम करणे.',
    footerPlatform: 'व्यासपीठ',
    footerResources: 'संसाधने',
    footerNewsletter: 'न्यूजलेटर',
    footerNewsletterDesc: 'बाजार किंमत ट्रेंड मिळवण्यासाठी सदस्यत्व घ्या.',
    footerEmail: 'ईमेल पत्ता',
    footerJoin: 'सामील व्हा',
    footerRights: '© 2026 AgriBridge. सर्व हक्क राखीव.',
    footerPrivacy: 'गोपनीयता धोरण',
    footerTerms: 'सेवा अटी',
    footerFAQs: 'वारंवार विचारले जाणारे प्रश्न',
    footerHowItWorks: 'हे कसे काम करते',

    // Language Settings
    langSettings: 'भाषा',
    langSettingsDesc: 'संपूर्ण अॅप्लिकेशनसाठी तुमची पसंदीदा भाषा निवडा.',
    langLabel: 'पसंदीदा भाषा',
    langSelect: 'भाषा निवडा',
    langSaved: 'भाषा प्राधान्य जतन केले!',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export default translations;
