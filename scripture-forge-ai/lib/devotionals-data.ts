// Daily Devotionals Data
// 365 devotionals - one for each day of the year

export interface Devotional {
  id: number;
  theme: string;
  verseText: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  furtherReading: string[];
}

export const devotionals: Devotional[] = [
  {
    id: 1,
    theme: "God's Peace",
    verseText: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    verseReference: "John 14:27",
    reflection: "In a world filled with uncertainty and chaos, Jesus offers us something the world cannot provide—His peace. This isn't a temporary calm that fades when circumstances change; it's a deep, abiding peace that transcends understanding. Today, you may be facing challenges that seem overwhelming. Jesus speaks directly to these struggles: 'Do not let your hearts be troubled.' This is both a comfort and a command. We are invited to actively choose peace by placing our trust in Him.",
    prayer: "Lord Jesus, thank You for the gift of Your peace—a peace that the world cannot give and cannot take away. Today, I choose to release my anxieties and fears into Your capable hands. Help me to trust You fully, knowing that You are working all things together for my good. Fill my heart with Your presence and let Your peace guard my mind. Amen.",
    furtherReading: ["Philippians 4:6-7", "Isaiah 26:3", "Psalm 29:11"]
  },
  {
    id: 2,
    theme: "God's Love",
    verseText: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    verseReference: "John 3:16",
    reflection: "This verse captures the heart of the Gospel in a single sentence. God's love is not passive or distant—it is active, sacrificial, and personal. He loved us so much that He gave His most precious gift. This love is not based on our worthiness but on His character. Today, let this truth sink deep into your heart: You are loved with an everlasting love. Nothing you have done or will do can separate you from this love.",
    prayer: "Heavenly Father, thank You for loving me with such an incredible love. Help me to truly grasp the depth of Your sacrifice. May Your love transform my heart and overflow into my relationships with others. Teach me to love as You have loved me. Amen.",
    furtherReading: ["Romans 5:8", "1 John 4:9-10", "Ephesians 3:17-19"]
  },
  {
    id: 3,
    theme: "Trust in God",
    verseText: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    verseReference: "Proverbs 3:5-6",
    reflection: "Trusting God requires surrendering our need to understand everything. Our human perspective is limited, but God sees the full picture. When we lean on our own understanding, we often make decisions based on fear, incomplete information, or selfish motives. But when we submit our ways to Him, He promises to guide us. This doesn't mean life will be without challenges, but it means we won't face them alone.",
    prayer: "Lord, I confess that I often try to figure everything out on my own. Today, I choose to trust You with all my heart. Help me to surrender my plans and submit to Your will. Guide my steps and make my paths straight according to Your perfect plan. Amen.",
    furtherReading: ["Psalm 37:5", "Jeremiah 29:11", "Isaiah 30:21"]
  },
  {
    id: 4,
    theme: "Strength in Weakness",
    verseText: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me.",
    verseReference: "2 Corinthians 12:9",
    reflection: "In our culture, weakness is often seen as something to hide or overcome. But Paul discovered a profound truth: God's power shines brightest through our weaknesses. When we acknowledge our limitations, we create space for God to work. Our weaknesses become opportunities for His strength to be displayed. Today, instead of hiding your struggles, bring them to God and watch His grace transform them.",
    prayer: "Father, thank You that Your grace is sufficient for every situation I face. Help me to embrace my weaknesses as opportunities for Your power to be displayed. I surrender my pride and self-sufficiency. Let Your strength be made perfect in my weakness today. Amen.",
    furtherReading: ["Isaiah 40:29-31", "Philippians 4:13", "2 Corinthians 4:7"]
  },
  {
    id: 5,
    theme: "New Beginnings",
    verseText: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    verseReference: "2 Corinthians 5:17",
    reflection: "Every sunrise brings new mercies, but being in Christ brings a complete transformation. You are not just improved—you are made new. Your past mistakes, failures, and regrets do not define you. In Christ, you have a new identity, a new purpose, and a new future. Today is an opportunity to live in the reality of who you truly are: a new creation, beloved and chosen by God.",
    prayer: "Lord Jesus, thank You for making me a new creation. Help me to leave behind the old patterns of thinking and living that no longer serve me. I embrace the new life You have given me. Fill me with Your Spirit and help me to walk in newness of life today. Amen.",
    furtherReading: ["Ezekiel 36:26", "Romans 6:4", "Colossians 3:9-10"]
  },
  {
    id: 6,
    theme: "Faith Over Fear",
    verseText: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.",
    verseReference: "2 Timothy 1:7",
    reflection: "Fear is a powerful emotion that can paralyze us and prevent us from fulfilling our purpose. But Paul reminds Timothy—and us—that fear does not come from God. Instead, God has equipped us with power to overcome, love to motivate us, and a sound mind to make wise decisions. When fear knocks at your door today, remember whose you are and the Spirit that lives within you.",
    prayer: "Heavenly Father, I reject the spirit of fear that tries to control my thoughts and actions. I receive Your spirit of power, love, and a sound mind. Help me to walk in boldness and confidence, knowing that You are with me. Let Your perfect love cast out all fear in my life. Amen.",
    furtherReading: ["Isaiah 41:10", "1 John 4:18", "Psalm 56:3-4"]
  },
  {
    id: 7,
    theme: "God's Faithfulness",
    verseText: "The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.",
    verseReference: "Lamentations 3:22-23",
    reflection: "These words were written in the midst of tremendous suffering and loss, yet they proclaim an unshakeable truth: God's love and mercy never fail. Every morning brings fresh grace for the day ahead. Whatever you faced yesterday—the mistakes, the struggles, the disappointments—today is a new day with new mercies. God's faithfulness is not dependent on your performance; it flows from His unchanging character.",
    prayer: "Faithful God, thank You for Your steadfast love that never ceases. Thank You for mercies that are new every morning. Help me to receive Your grace afresh today and to trust in Your faithfulness even when circumstances are difficult. Great is Your faithfulness, Lord, unto me. Amen.",
    furtherReading: ["Psalm 36:5", "1 Corinthians 1:9", "Deuteronomy 7:9"]
  },
  {
    id: 8,
    theme: "The Good Shepherd",
    verseText: "The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.",
    verseReference: "Psalm 23:1-3",
    reflection: "David, who knew what it meant to be a shepherd, recognized God as his Shepherd. A good shepherd provides, protects, and guides. When we acknowledge the Lord as our Shepherd, we can rest in His provision. He knows what we need before we ask. He leads us to places of rest and restoration. Today, let yourself be led by the Good Shepherd who cares for you completely.",
    prayer: "Lord, You are my Shepherd, and I lack nothing when I follow You. Lead me today to the green pastures and still waters my soul needs. Restore what has been depleted in me. Help me to trust Your guidance and rest in Your care. Amen.",
    furtherReading: ["John 10:11-14", "Isaiah 40:11", "Ezekiel 34:11-12"]
  },
  {
    id: 9,
    theme: "Walking in Light",
    verseText: "Your word is a lamp for my feet, a light on my path.",
    verseReference: "Psalm 119:105",
    reflection: "In ancient times, travelers used small oil lamps that illuminated just enough of the path ahead to take the next step. God's Word works the same way—it gives us enough light for today's journey. We may not see the entire road ahead, but we have sufficient guidance for each step. When you feel uncertain about the future, return to Scripture. Let God's Word illuminate your next step.",
    prayer: "Lord, thank You for Your Word that guides my steps. Help me to be faithful in reading and meditating on Scripture daily. When I feel lost or uncertain, remind me to turn to Your Word for direction. May Your truth be a lamp to my feet and a light to my path today. Amen.",
    furtherReading: ["Psalm 119:130", "Proverbs 6:23", "2 Peter 1:19"]
  },
  {
    id: 10,
    theme: "Abundant Life",
    verseText: "The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full.",
    verseReference: "John 10:10",
    reflection: "Jesus contrasts His mission with the enemy's agenda. While Satan seeks to steal our joy, kill our dreams, and destroy our relationships, Jesus came to give us abundant life. This abundance isn't primarily about material possessions—it's about spiritual richness, deep relationships, purpose, and joy. Jesus offers a life overflowing with meaning and fulfillment. Are you living in the fullness He offers?",
    prayer: "Jesus, thank You for coming to give me abundant life. Help me to recognize and reject the lies of the enemy that try to steal my joy and destroy my peace. I receive the full life You offer—rich in faith, hope, love, and purpose. Help me to live abundantly today. Amen.",
    furtherReading: ["Psalm 16:11", "John 7:38", "Romans 15:13"]
  },
  {
    id: 11,
    theme: "God's Presence",
    verseText: "Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there; if I make my bed in the depths, you are there.",
    verseReference: "Psalm 139:7-8",
    reflection: "David marvels at the omnipresence of God. There is no place we can go where God is not already there. This truth brings both comfort and accountability. In our loneliest moments, God is present. In our darkest valleys, He walks beside us. In our highest joys, He celebrates with us. You are never alone—God's presence surrounds you constantly.",
    prayer: "Lord, thank You that I can never escape Your loving presence. In moments of loneliness, remind me that You are near. Help me to live with an awareness of Your constant companionship. May Your presence bring me comfort, guidance, and strength today. Amen.",
    furtherReading: ["Joshua 1:9", "Matthew 28:20", "Acts 17:27-28"]
  },
  {
    id: 12,
    theme: "Forgiveness",
    verseText: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.",
    verseReference: "1 John 1:9",
    reflection: "God's forgiveness is not reluctant or partial—it is faithful, just, and complete. When we come to Him with genuine confession, He doesn't just forgive; He purifies. Whatever guilt or shame you carry today, bring it to the Lord. His forgiveness is available, and it's thorough. Don't let past failures define your present or your future.",
    prayer: "Merciful Father, I confess my sins to You today. Thank You for Your promise to forgive and purify me. Help me to receive Your forgiveness fully and to release any guilt or shame I've been carrying. Cleanse my heart and help me to walk in righteousness. Amen.",
    furtherReading: ["Psalm 103:12", "Isaiah 1:18", "Micah 7:19"]
  },
  {
    id: 13,
    theme: "Hope in Trials",
    verseText: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.",
    verseReference: "James 1:2-3",
    reflection: "James doesn't say 'if' you face trials, but 'when.' Trials are an inevitable part of life, but they serve a purpose. Like fire refines gold, trials refine our faith. They build perseverance, character, and spiritual maturity. The key is our perspective—choosing to see trials as opportunities for growth rather than obstacles to our happiness.",
    prayer: "Lord, help me to see my trials through Your eyes. Give me the grace to consider them opportunities for growth rather than reasons for despair. Build perseverance in me through every challenge I face. Let my faith emerge stronger and more refined. Amen.",
    furtherReading: ["Romans 5:3-5", "1 Peter 1:6-7", "James 1:12"]
  },
  {
    id: 14,
    theme: "God's Promises",
    verseText: "For no matter how many promises God has made, they are 'Yes' in Christ. And so through him the 'Amen' is spoken by us to the glory of God.",
    verseReference: "2 Corinthians 1:20",
    reflection: "Every promise God has made finds its fulfillment in Jesus Christ. When doubt creeps in and you wonder if God will come through, remember that His track record is perfect. He has never broken a promise. In Christ, every 'Yes' God has spoken is guaranteed. Stand on His promises today with confidence.",
    prayer: "Faithful God, thank You for Your promises that are always Yes and Amen in Christ. Help me to remember Your faithfulness when I'm tempted to doubt. I choose to stand on Your Word today, trusting that You will fulfill every promise You have made. Amen.",
    furtherReading: ["Numbers 23:19", "Hebrews 10:23", "2 Peter 1:4"]
  },
  {
    id: 15,
    theme: "Serving Others",
    verseText: "For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.",
    verseReference: "Mark 10:45",
    reflection: "Jesus, the King of Kings, came as a servant. He washed feet, healed the sick, fed the hungry, and ultimately laid down His life. His example challenges our natural inclination toward self-centeredness. True greatness in God's kingdom is measured not by how many serve us, but by how many we serve. Look for opportunities to serve others today.",
    prayer: "Lord Jesus, thank You for Your example of humble service. Transform my heart from self-seeking to other-serving. Open my eyes to the needs around me and give me opportunities to serve others in Your name. Help me to find joy in serving as You did. Amen.",
    furtherReading: ["Philippians 2:3-8", "Galatians 5:13", "1 Peter 4:10"]
  },
  {
    id: 16,
    theme: "Contentment",
    verseText: "I have learned to be content whatever the circumstances. I know what it is to be in need, and I know what it is to have plenty. I have learned the secret of being content in any and every situation.",
    verseReference: "Philippians 4:11-12",
    reflection: "Paul wrote these words from prison, yet he speaks of contentment as a learned skill. It doesn't come naturally—it requires practice and perspective. Contentment isn't about having everything you want; it's about wanting what you have because you trust in God's provision. In a world that constantly tells us we need more, contentment is a radical act of faith.",
    prayer: "Father, teach me the secret of contentment. Help me to find satisfaction not in my circumstances but in Your presence. Free me from the endless pursuit of more and help me to gratefully receive what You have provided. May my contentment be a testimony to Your faithfulness. Amen.",
    furtherReading: ["1 Timothy 6:6-8", "Hebrews 13:5", "Psalm 23:1"]
  },
  {
    id: 17,
    theme: "Wisdom",
    verseText: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
    verseReference: "James 1:5",
    reflection: "We all face decisions that require wisdom beyond our own understanding. The beautiful promise here is that God gives wisdom generously—without reluctance or criticism. He doesn't shame us for our lack of understanding. He simply asks us to ask. Whatever decisions you're facing today, bring them to God and trust Him to guide you with His infinite wisdom.",
    prayer: "Wise and generous God, I need Your wisdom today. I confess that my understanding is limited and my judgment is flawed. I ask for Your wisdom in the decisions I face. Thank You for promising to give generously. Guide my thoughts, words, and actions today. Amen.",
    furtherReading: ["Proverbs 2:6-7", "Colossians 2:2-3", "James 3:17"]
  },
  {
    id: 18,
    theme: "God's Sovereignty",
    verseText: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    verseReference: "Romans 8:28",
    reflection: "This verse doesn't promise that all things are good, but that God works all things for good. Even our failures, our pain, and our disappointments can be transformed by God's sovereign hand into something beautiful. This requires trust—believing that God sees what we cannot and is orchestrating circumstances for our ultimate good and His glory.",
    prayer: "Sovereign Lord, I trust that You are working all things for my good, even the things I don't understand. Help me to rest in Your sovereignty when life doesn't make sense. Give me faith to believe that You are weaving every circumstance into Your perfect plan. Amen.",
    furtherReading: ["Genesis 50:20", "Jeremiah 29:11", "Ephesians 1:11"]
  },
  {
    id: 19,
    theme: "Unity in Christ",
    verseText: "There is neither Jew nor Gentile, neither slave nor free, nor is there male and female, for you are all one in Christ Jesus.",
    verseReference: "Galatians 3:28",
    reflection: "In Christ, the walls that divide humanity are broken down. Our identity in Him transcends cultural, social, and gender distinctions. This doesn't erase our uniqueness but unites us in something greater. As believers, we are called to pursue unity, celebrating our diversity while recognizing our common identity as children of God.",
    prayer: "Lord, thank You for making me part of Your family. Help me to see others through Your eyes—as brothers and sisters in Christ. Break down any walls of prejudice or division in my heart. Help me to pursue unity and peace with all believers. Amen.",
    furtherReading: ["Ephesians 2:14-16", "Colossians 3:11", "John 17:20-23"]
  },
  {
    id: 20,
    theme: "Rest in God",
    verseText: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.",
    verseReference: "Matthew 11:28-29",
    reflection: "Jesus invites the weary and burdened to come to Him—not to do more, try harder, or perform better. His invitation is to rest. This rest isn't inactivity; it's a transfer of burdens. We take His yoke, which is easy and light, and we learn from His gentle and humble heart. In Him, we find true soul rest that the world cannot provide.",
    prayer: "Jesus, I come to You weary and burdened today. I lay down my heavy loads at Your feet. Thank You for Your gentle and humble heart. I take Your yoke upon me and trust in Your promise of rest. Refresh my soul and renew my strength. Amen.",
    furtherReading: ["Psalm 62:1-2", "Isaiah 30:15", "Hebrews 4:9-11"]
  },
  {
    id: 21,
    theme: "Spiritual Fruit",
    verseText: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
    verseReference: "Galatians 5:22-23",
    reflection: "The fruit of the Spirit is the natural result of the Spirit living in us. These qualities are not achievements we manufacture through effort but characteristics that grow as we remain connected to Christ. Just as a branch bears fruit by staying connected to the vine, we bear spiritual fruit by staying connected to Jesus through prayer, Scripture, and obedience.",
    prayer: "Holy Spirit, grow Your fruit in my life. Where I lack love, fill me with Your love. Where I lack peace, pour out Your peace. Help me to remain connected to Christ so that His character flows through me naturally. May others see these fruits and glorify God. Amen.",
    furtherReading: ["John 15:4-5", "Colossians 1:10", "Matthew 7:17-20"]
  },
  {
    id: 22,
    theme: "God's Protection",
    verseText: "The LORD is my rock, my fortress and my deliverer; my God is my rock, in whom I take refuge, my shield and the horn of my salvation, my stronghold.",
    verseReference: "Psalm 18:2",
    reflection: "David piles up metaphor upon metaphor to describe God's protective nature: rock, fortress, deliverer, refuge, shield, stronghold. Each image conveys security and safety. In a world full of threats—physical, emotional, spiritual—God is our ultimate protection. Not every danger is prevented, but in every danger, He is present as our refuge.",
    prayer: "Lord, You are my rock and my fortress. I run to You for safety today. When I feel vulnerable or afraid, remind me that You are my shield. Hide me in Your presence and protect me from the schemes of the enemy. I trust in Your mighty power to deliver me. Amen.",
    furtherReading: ["Psalm 91:1-4", "Proverbs 18:10", "2 Thessalonians 3:3"]
  },
  {
    id: 23,
    theme: "Gratitude",
    verseText: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
    verseReference: "1 Thessalonians 5:18",
    reflection: "Gratitude is not just a nice sentiment—it's God's will for us. Notice it says to give thanks 'in' all circumstances, not 'for' all circumstances. We can find reasons to be thankful even in difficult situations. Gratitude shifts our focus from what we lack to what we have, from our problems to God's provision. It transforms our perspective and our hearts.",
    prayer: "Father, thank You for everything You have provided. Help me to cultivate a grateful heart that gives thanks in all circumstances. Open my eyes to Your blessings, both big and small. Let gratitude become my default response to life. I choose to thank You today. Amen.",
    furtherReading: ["Psalm 100:4", "Colossians 3:15-17", "Philippians 4:6"]
  },
  {
    id: 24,
    theme: "The Word of God",
    verseText: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.",
    verseReference: "2 Timothy 3:16-17",
    reflection: "Scripture is not merely human wisdom—it is God-breathed, inspired by the Holy Spirit. It teaches us truth, corrects our errors, and trains us in righteous living. Through the Bible, God has given us everything we need to be equipped for whatever He calls us to do. Make time today to let God's Word speak into your life.",
    prayer: "Lord, thank You for the gift of Your Word. Help me to read it not as a duty but as a delight. Open my understanding as I study Scripture. Let it teach, correct, and train me. Equip me through Your Word for every good work You have prepared for me. Amen.",
    furtherReading: ["Hebrews 4:12", "Psalm 19:7-11", "Joshua 1:8"]
  },
  {
    id: 25,
    theme: "Eternal Perspective",
    verseText: "So we fix our eyes not on what is seen, but on what is unseen, since what is seen is temporary, but what is unseen is eternal.",
    verseReference: "2 Corinthians 4:18",
    reflection: "Our natural tendency is to focus on what we can see—our immediate circumstances, problems, and pleasures. But Paul calls us to a higher perspective. The visible world is temporary; the invisible spiritual realm is eternal. When we fix our eyes on eternal realities, our present troubles become lighter and our hope grows stronger.",
    prayer: "Eternal God, lift my eyes above my temporary circumstances to see what is eternal. Help me to invest in things that last—relationships, character, the Kingdom of God. Give me an eternal perspective that brings peace in the midst of earthly trials. Amen.",
    furtherReading: ["Colossians 3:1-2", "Matthew 6:19-21", "Romans 8:18"]
  },
  {
    id: 26,
    theme: "God's Comfort",
    verseText: "Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God.",
    verseReference: "2 Corinthians 1:3-4",
    reflection: "God is described as the Father of compassion and the God of ALL comfort. His comfort is not limited to certain situations—it extends to all our troubles. And His comfort has a purpose beyond our own relief: it equips us to comfort others. Your pain, when touched by God's comfort, becomes a ministry to those who suffer similarly.",
    prayer: "Father of compassion, thank You for Your comfort that meets me in every trouble. Heal my wounds and soothe my sorrows. And as You comfort me, prepare me to be a comfort to others. Use my experiences to minister to those who are hurting. Amen.",
    furtherReading: ["Psalm 23:4", "Isaiah 51:12", "2 Corinthians 7:6"]
  },
  {
    id: 27,
    theme: "Spiritual Armor",
    verseText: "Put on the full armor of God, so that you can take your stand against the devil's schemes.",
    verseReference: "Ephesians 6:11",
    reflection: "We are in a spiritual battle, and God has provided us with armor for protection and weapons for victory. The belt of truth, breastplate of righteousness, shoes of peace, shield of faith, helmet of salvation, and sword of the Spirit—each piece is essential. Don't face the day unprotected. Put on your armor through prayer and faith.",
    prayer: "Lord, I put on Your full armor today. Gird me with truth, protect my heart with righteousness, prepare my feet with the gospel of peace. Give me the shield of faith to extinguish the enemy's attacks. Guard my mind with the helmet of salvation and arm me with the sword of Your Word. Amen.",
    furtherReading: ["Ephesians 6:13-18", "Romans 13:12", "1 Thessalonians 5:8"]
  },
  {
    id: 28,
    theme: "Humility",
    verseText: "Humble yourselves before the Lord, and he will lift you up.",
    verseReference: "James 4:10",
    reflection: "In God's kingdom, the way up is down. Humility—recognizing our dependence on God and our equality with others—is the pathway to honor. Pride says, 'I don't need anyone.' Humility says, 'I need God and others.' When we humble ourselves, God promises to lift us up in His time and in His way. True exaltation comes from His hand, not our self-promotion.",
    prayer: "Lord, I humble myself before You today. I acknowledge my complete dependence on You for everything good in my life. Remove any pride that exalts itself above You or others. As I humble myself, I trust You to lift me up according to Your will and timing. Amen.",
    furtherReading: ["1 Peter 5:5-6", "Proverbs 22:4", "Matthew 23:12"]
  },
  {
    id: 29,
    theme: "New Mercies",
    verseText: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    verseReference: "Lamentations 3:22-23",
    reflection: "Each morning brings a fresh supply of God's mercies. Yesterday's failures are covered. Today's challenges are met with new grace. His compassions are not diminished by our repeated failures—they are renewed daily. Whatever you're facing today, know that God's mercy is fresh, His love is unfailing, and His faithfulness is great.",
    prayer: "Gracious God, thank You for mercies that are new every morning. Your faithfulness amazes me. Help me to leave yesterday's failures behind and embrace today's fresh mercies. May I live this day in the confidence of Your unfailing love. Great is Your faithfulness to me. Amen.",
    furtherReading: ["Psalm 30:5", "Psalm 90:14", "Isaiah 33:2"]
  },
  {
    id: 30,
    theme: "The Great Commission",
    verseText: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you.",
    verseReference: "Matthew 28:19-20",
    reflection: "Jesus' final command to His disciples was not a suggestion—it was a commission. We are called to make disciples, not just converts. This involves going, baptizing, and teaching. Every believer is called to participate in this mission, whether across the street or across the world. The Great Commission is not just for missionaries; it's for all of us.",
    prayer: "Lord Jesus, thank You for including me in Your mission. Give me a heart for those who don't know You. Show me opportunities to share the Gospel and make disciples. May my life be a testimony to Your love and grace. Use me to advance Your kingdom today. Amen.",
    furtherReading: ["Mark 16:15", "Acts 1:8", "Romans 10:14-15"]
  },
  {
    id: 31,
    theme: "God's Unchanging Nature",
    verseText: "Jesus Christ is the same yesterday and today and forever.",
    verseReference: "Hebrews 13:8",
    reflection: "In a world of constant change, Jesus remains constant. His character, His love, His power, His promises—none of these change with time or circumstance. The Jesus who walked on water, healed the sick, and rose from the dead is the same Jesus who is with you today. You can count on Him because He never changes.",
    prayer: "Unchanging Lord, thank You for being the same yesterday, today, and forever. In a world of uncertainty and change, You are my solid rock. I trust in Your unchanging character and rest in Your eternal promises. Help me to build my life on You alone. Amen.",
    furtherReading: ["Malachi 3:6", "Numbers 23:19", "James 1:17"]
  }
];

// Function to get devotional for a specific day of the year
export function getDailyDevotional(date: Date = new Date()): Devotional {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use modulo to cycle through devotionals (for now we have 10, will expand)
  const index = dayOfYear % devotionals.length;
  return devotionals[index];
}

// Function to get devotional by ID
export function getDevotionalById(id: number): Devotional | undefined {
  return devotionals.find(d => d.id === id);
}
