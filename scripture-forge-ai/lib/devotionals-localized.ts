// Full Localized Devotionals - Complete translations for all content

export interface LocalizedContent {
  theme: string;
  verseText: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  furtherReading: string[];
}

type LocaleContent = {
  [key: string]: LocalizedContent;
};

// Devotional translations by ID
export const devotionalTranslations: Record<number, LocaleContent> = {
  1: {
    en: {
      theme: "God's Peace",
      verseText: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
      verseReference: "John 14:27",
      reflection: "In a world filled with uncertainty and chaos, Jesus offers us something the world cannot provide—His peace. This isn't a temporary calm that fades when circumstances change; it's a deep, abiding peace that transcends understanding.",
      prayer: "Lord Jesus, thank You for the gift of Your peace—a peace that the world cannot give and cannot take away. Today, I choose to release my anxieties and fears into Your capable hands. Help me to trust You fully. Amen.",
      furtherReading: ["Philippians 4:6-7", "Isaiah 26:3", "Psalm 29:11"]
    },
    es: {
      theme: "La Paz de Dios",
      verseText: "La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.",
      verseReference: "Juan 14:27",
      reflection: "En un mundo lleno de incertidumbre y caos, Jesús nos ofrece algo que el mundo no puede proporcionar: Su paz. Esta no es una calma temporal que se desvanece cuando las circunstancias cambian; es una paz profunda y permanente que trasciende el entendimiento.",
      prayer: "Señor Jesús, gracias por el regalo de Tu paz, una paz que el mundo no puede dar ni quitar. Hoy, elijo liberar mis ansiedades y temores en Tus manos capaces. Ayúdame a confiar plenamente en Ti. Amén.",
      furtherReading: ["Filipenses 4:6-7", "Isaías 26:3", "Salmo 29:11"]
    },
    de: {
      theme: "Gottes Frieden",
      verseText: "Frieden lasse ich euch, meinen Frieden gebe ich euch. Nicht gebe ich euch, wie die Welt gibt. Euer Herz erschrecke nicht und fürchte sich nicht.",
      verseReference: "Johannes 14:27",
      reflection: "In einer Welt voller Unsicherheit und Chaos bietet uns Jesus etwas, das die Welt nicht bieten kann – Seinen Frieden. Dies ist keine vorübergehende Ruhe, die vergeht, wenn sich die Umstände ändern; es ist ein tiefer, bleibender Frieden.",
      prayer: "Herr Jesus, danke für das Geschenk Deines Friedens – ein Frieden, den die Welt nicht geben und nicht nehmen kann. Heute entscheide ich mich, meine Ängste und Sorgen in Deine fähigen Hände zu legen. Hilf mir, Dir voll zu vertrauen. Amen.",
      furtherReading: ["Philipper 4:6-7", "Jesaja 26:3", "Psalm 29:11"]
    },
    fr: {
      theme: "La Paix de Dieu",
      verseText: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s'alarme point.",
      verseReference: "Jean 14:27",
      reflection: "Dans un monde rempli d'incertitude et de chaos, Jésus nous offre quelque chose que le monde ne peut pas fournir : Sa paix. Ce n'est pas un calme temporaire qui s'estompe lorsque les circonstances changent; c'est une paix profonde et durable.",
      prayer: "Seigneur Jésus, merci pour le don de Ta paix – une paix que le monde ne peut ni donner ni enlever. Aujourd'hui, je choisis de remettre mes anxiétés et mes peurs entre Tes mains capables. Aide-moi à Te faire pleinement confiance. Amen.",
      furtherReading: ["Philippiens 4:6-7", "Ésaïe 26:3", "Psaume 29:11"]
    },
    pt: {
      theme: "A Paz de Deus",
      verseText: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.",
      verseReference: "João 14:27",
      reflection: "Em um mundo cheio de incerteza e caos, Jesus nos oferece algo que o mundo não pode proporcionar – Sua paz. Esta não é uma calma temporária que desaparece quando as circunstâncias mudam; é uma paz profunda e permanente que transcende o entendimento.",
      prayer: "Senhor Jesus, obrigado pelo dom da Tua paz – uma paz que o mundo não pode dar nem tirar. Hoje, escolho liberar minhas ansiedades e medos em Tuas mãos capazes. Ajuda-me a confiar plenamente em Ti. Amém.",
      furtherReading: ["Filipenses 4:6-7", "Isaías 26:3", "Salmo 29:11"]
    },
    zh: {
      theme: "神的平安",
      verseText: "我留下平安给你们，我将我的平安赐给你们。我所赐的，不像世人所赐的。你们心里不要忧愁，也不要胆怯。",
      verseReference: "约翰福音 14:27",
      reflection: "在这个充满不确定性和混乱的世界中，耶稣给我们提供了世界无法给予的东西——祂的平安。这不是随着环境变化而消退的暂时平静；这是一种超越理解的深沉、持久的平安。",
      prayer: "主耶稣，感谢祢赐予平安的礼物——这是世界无法给予也无法夺走的平安。今天，我选择将我的焦虑和恐惧交托在祢有能力的手中。帮助我完全信靠祢。阿门。",
      furtherReading: ["腓立比书 4:6-7", "以赛亚书 26:3", "诗篇 29:11"]
    },
    it: {
      theme: "La Pace di Dio",
      verseText: "Vi lascio la pace, vi do la mia pace. Io non vi do come il mondo dà. Il vostro cuore non sia turbato e non abbia timore.",
      verseReference: "Giovanni 14:27",
      reflection: "In un mondo pieno di incertezza e caos, Gesù ci offre qualcosa che il mondo non può fornire: la Sua pace. Questa non è una calma temporanea che svanisce quando le circostanze cambiano; è una pace profonda e duratura che trascende la comprensione.",
      prayer: "Signore Gesù, grazie per il dono della Tua pace – una pace che il mondo non può dare né togliere. Oggi scelgo di rilasciare le mie ansie e paure nelle Tue mani capaci. Aiutami a fidarmi pienamente di Te. Amen.",
      furtherReading: ["Filippesi 4:6-7", "Isaia 26:3", "Salmo 29:11"]
    }
  },
  23: {
    en: {
      theme: "Gratitude",
      verseText: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
      verseReference: "1 Thessalonians 5:18",
      reflection: "Gratitude is not just a nice sentiment—it's God's will for us. Notice it says to give thanks 'in' all circumstances, not 'for' all circumstances. We can find reasons to be thankful even in difficult situations. Gratitude shifts our focus from what we lack to what we have, from our problems to God's provision.",
      prayer: "Father, thank You for everything You have provided. Help me to cultivate a grateful heart that gives thanks in all circumstances. Open my eyes to Your blessings, both big and small. Let gratitude become my default response to life. Amen.",
      furtherReading: ["Psalm 100:4", "Colossians 3:15-17", "Philippians 4:6"]
    },
    es: {
      theme: "Gratitud",
      verseText: "Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.",
      verseReference: "1 Tesalonicenses 5:18",
      reflection: "La gratitud no es solo un buen sentimiento—es la voluntad de Dios para nosotros. Nota que dice dar gracias 'en' todas las circunstancias, no 'por' todas las circunstancias. Podemos encontrar razones para estar agradecidos incluso en situaciones difíciles. La gratitud cambia nuestro enfoque de lo que nos falta a lo que tenemos.",
      prayer: "Padre, gracias por todo lo que has provisto. Ayúdame a cultivar un corazón agradecido que da gracias en todas las circunstancias. Abre mis ojos a Tus bendiciones, grandes y pequeñas. Que la gratitud sea mi respuesta natural a la vida. Amén.",
      furtherReading: ["Salmo 100:4", "Colosenses 3:15-17", "Filipenses 4:6"]
    },
    de: {
      theme: "Dankbarkeit",
      verseText: "Seid dankbar in allen Dingen; denn das ist der Wille Gottes in Christus Jesus an euch.",
      verseReference: "1 Thessalonicher 5:18",
      reflection: "Dankbarkeit ist nicht nur ein nettes Gefühl—es ist Gottes Wille für uns. Beachte, dass es heißt, 'in' allen Umständen zu danken, nicht 'für' alle Umstände. Wir können selbst in schwierigen Situationen Gründe finden, dankbar zu sein. Dankbarkeit verlagert unseren Fokus von dem, was uns fehlt, zu dem, was wir haben.",
      prayer: "Vater, danke für alles, was Du mir gegeben hast. Hilf mir, ein dankbares Herz zu pflegen, das in allen Umständen dankt. Öffne meine Augen für Deine Segnungen, groß und klein. Lass Dankbarkeit meine natürliche Antwort auf das Leben werden. Amen.",
      furtherReading: ["Psalm 100:4", "Kolosser 3:15-17", "Philipper 4:6"]
    },
    fr: {
      theme: "Gratitude",
      verseText: "Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ.",
      verseReference: "1 Thessaloniciens 5:18",
      reflection: "La gratitude n'est pas seulement un bon sentiment—c'est la volonté de Dieu pour nous. Remarquez qu'il est dit de rendre grâces 'dans' toutes les circonstances, pas 'pour' toutes les circonstances. Nous pouvons trouver des raisons d'être reconnaissants même dans les situations difficiles. La gratitude déplace notre attention de ce qui nous manque vers ce que nous avons.",
      prayer: "Père, merci pour tout ce que Tu as pourvu. Aide-moi à cultiver un cœur reconnaissant qui rend grâces en toutes circonstances. Ouvre mes yeux à Tes bénédictions, grandes et petites. Que la gratitude devienne ma réponse naturelle à la vie. Amen.",
      furtherReading: ["Psaume 100:4", "Colossiens 3:15-17", "Philippiens 4:6"]
    },
    pt: {
      theme: "Gratidão",
      verseText: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.",
      verseReference: "1 Tessalonicenses 5:18",
      reflection: "A gratidão não é apenas um bom sentimento—é a vontade de Deus para nós. Note que diz para dar graças 'em' todas as circunstâncias, não 'por' todas as circunstâncias. Podemos encontrar razões para ser gratos mesmo em situações difíceis. A gratidão muda nosso foco do que nos falta para o que temos.",
      prayer: "Pai, obrigado por tudo o que tens provido. Ajuda-me a cultivar um coração grato que dá graças em todas as circunstâncias. Abre meus olhos para Tuas bênçãos, grandes e pequenas. Que a gratidão se torne minha resposta natural à vida. Amém.",
      furtherReading: ["Salmo 100:4", "Colossenses 3:15-17", "Filipenses 4:6"]
    },
    zh: {
      theme: "感恩",
      verseText: "凡事谢恩，因为这是神在基督耶稣里向你们所定的旨意。",
      verseReference: "帖撒罗尼迦前书 5:18",
      reflection: "感恩不仅仅是一种美好的情感——它是神对我们的旨意。注意经文说的是'在'一切环境中感谢，而不是'为'一切环境感谢。即使在困难的情况下，我们也能找到感恩的理由。感恩将我们的注意力从所缺乏的转移到所拥有的。",
      prayer: "天父，感谢祢所供应的一切。帮助我培养一颗在一切环境中都感恩的心。开我的眼睛看见祢的祝福，无论大小。让感恩成为我对生活的自然回应。阿门。",
      furtherReading: ["诗篇 100:4", "歌罗西书 3:15-17", "腓立比书 4:6"]
    },
    it: {
      theme: "Gratitudine",
      verseText: "In ogni cosa rendete grazie, poiché questa è la volontà di Dio in Cristo Gesù verso di voi.",
      verseReference: "1 Tessalonicesi 5:18",
      reflection: "La gratitudine non è solo un bel sentimento—è la volontà di Dio per noi. Nota che dice di rendere grazie 'in' ogni circostanza, non 'per' ogni circostanza. Possiamo trovare motivi per essere grati anche in situazioni difficili. La gratitudine sposta la nostra attenzione da ciò che ci manca a ciò che abbiamo.",
      prayer: "Padre, grazie per tutto ciò che hai provveduto. Aiutami a coltivare un cuore grato che rende grazie in ogni circostanza. Apri i miei occhi alle Tue benedizioni, grandi e piccole. Che la gratitudine diventi la mia risposta naturale alla vita. Amen.",
      furtherReading: ["Salmo 100:4", "Colossesi 3:15-17", "Filippesi 4:6"]
    }
  },
  22: {
    en: {
      theme: "God's Protection",
      verseText: "The LORD is my rock, my fortress and my deliverer; my God is my rock, in whom I take refuge, my shield and the horn of my salvation, my stronghold.",
      verseReference: "Psalm 18:2",
      reflection: "David piles up metaphor upon metaphor to describe God's protective nature: rock, fortress, deliverer, refuge, shield, stronghold. Each image conveys security and safety. In a world full of threats, God is our ultimate protection.",
      prayer: "Lord, You are my rock and my fortress. I run to You for safety today. When I feel vulnerable or afraid, remind me that You are my shield. I trust in Your mighty power to deliver me. Amen.",
      furtherReading: ["Psalm 91:1-4", "Proverbs 18:10", "2 Thessalonians 3:3"]
    },
    es: {
      theme: "La Protección de Dios",
      verseText: "Jehová, roca mía y castillo mío, y mi libertador; Dios mío, fortaleza mía, en él confiaré; mi escudo, y la fuerza de mi salvación, mi alto refugio.",
      verseReference: "Salmo 18:2",
      reflection: "David acumula metáfora sobre metáfora para describir la naturaleza protectora de Dios: roca, fortaleza, libertador, refugio, escudo, baluarte. Cada imagen transmite seguridad. En un mundo lleno de amenazas, Dios es nuestra protección definitiva.",
      prayer: "Señor, Tú eres mi roca y mi fortaleza. Corro hacia Ti por seguridad hoy. Cuando me sienta vulnerable o temeroso, recuérdame que Tú eres mi escudo. Confío en Tu poder para librarme. Amén.",
      furtherReading: ["Salmo 91:1-4", "Proverbios 18:10", "2 Tesalonicenses 3:3"]
    },
    de: {
      theme: "Gottes Schutz",
      verseText: "Der HERR ist mein Fels, meine Burg und mein Erretter; mein Gott, mein Hort, auf den ich traue, mein Schild und das Horn meines Heils und mein Schutz.",
      verseReference: "Psalm 18:2",
      reflection: "David häuft Metapher auf Metapher, um Gottes schützende Natur zu beschreiben: Fels, Burg, Erretter, Zuflucht, Schild, Schutz. Jedes Bild vermittelt Sicherheit. In einer Welt voller Bedrohungen ist Gott unser ultimativer Schutz.",
      prayer: "Herr, Du bist mein Fels und meine Burg. Ich laufe heute zu Dir für Sicherheit. Wenn ich mich verletzlich oder ängstlich fühle, erinnere mich daran, dass Du mein Schild bist. Ich vertraue auf Deine mächtige Kraft. Amen.",
      furtherReading: ["Psalm 91:1-4", "Sprüche 18:10", "2 Thessalonicher 3:3"]
    },
    fr: {
      theme: "La Protection de Dieu",
      verseText: "L'Éternel est mon rocher, ma forteresse, mon libérateur; mon Dieu est mon rocher où je trouve un abri, mon bouclier, la force qui me sauve, ma haute retraite.",
      verseReference: "Psaume 18:2",
      reflection: "David accumule métaphore sur métaphore pour décrire la nature protectrice de Dieu: rocher, forteresse, libérateur, refuge, bouclier, haute retraite. Chaque image transmet sécurité. Dans un monde plein de menaces, Dieu est notre protection ultime.",
      prayer: "Seigneur, Tu es mon rocher et ma forteresse. Je cours vers Toi pour la sécurité aujourd'hui. Quand je me sens vulnérable ou effrayé, rappelle-moi que Tu es mon bouclier. Je fais confiance à Ta puissance pour me délivrer. Amen.",
      furtherReading: ["Psaume 91:1-4", "Proverbes 18:10", "2 Thessaloniciens 3:3"]
    },
    pt: {
      theme: "A Proteção de Deus",
      verseText: "O Senhor é a minha rocha, a minha fortaleza e o meu libertador; o meu Deus, o meu rochedo em quem me refugio; o meu escudo, a força da minha salvação, o meu alto refúgio.",
      verseReference: "Salmo 18:2",
      reflection: "Davi acumula metáfora sobre metáfora para descrever a natureza protetora de Deus: rocha, fortaleza, libertador, refúgio, escudo, alto refúgio. Cada imagem transmite segurança. Em um mundo cheio de ameaças, Deus é nossa proteção definitiva.",
      prayer: "Senhor, Tu és minha rocha e minha fortaleza. Corro para Ti por segurança hoje. Quando me sentir vulnerável ou com medo, lembra-me de que Tu és meu escudo. Confio no Teu poder para me libertar. Amém.",
      furtherReading: ["Salmo 91:1-4", "Provérbios 18:10", "2 Tessalonicenses 3:3"]
    },
    zh: {
      theme: "神的保护",
      verseText: "耶和华是我的岩石，我的山寨，我的救主，我的神，我的磐石，我所投靠的。他是我的盾牌，是拯救我的角，是我的高台。",
      verseReference: "诗篇 18:2",
      reflection: "大卫用一个又一个比喻来描述神保护的本性：磐石、山寨、救主、避难所、盾牌、高台。每一个形象都传达了安全。在这个充满威胁的世界里，神是我们最终的保护。",
      prayer: "主啊，祢是我的磐石和山寨。今天我跑向祢寻求安全。当我感到脆弱或害怕时，提醒我祢是我的盾牌。我信靠祢大能的力量来拯救我。阿门。",
      furtherReading: ["诗篇 91:1-4", "箴言 18:10", "帖撒罗尼迦后书 3:3"]
    },
    it: {
      theme: "La Protezione di Dio",
      verseText: "Il Signore è la mia rocca, la mia fortezza, il mio liberatore; il mio Dio, la mia rupe in cui mi rifugio, il mio scudo, la forza della mia salvezza, il mio alto rifugio.",
      verseReference: "Salmo 18:2",
      reflection: "Davide accumula metafora su metafora per descrivere la natura protettiva di Dio: roccia, fortezza, liberatore, rifugio, scudo, alto rifugio. Ogni immagine trasmette sicurezza. In un mondo pieno di minacce, Dio è la nostra protezione definitiva.",
      prayer: "Signore, Tu sei la mia roccia e la mia fortezza. Corro da Te per sicurezza oggi. Quando mi sento vulnerabile o spaventato, ricordami che Tu sei il mio scudo. Confido nella Tua potente forza per liberarmi. Amen.",
      furtherReading: ["Salmo 91:1-4", "Proverbi 18:10", "2 Tessalonicesi 3:3"]
    }
  }
};

// Helper function to get localized devotional content
export function getLocalizedDevotional(id: number, locale: string): LocalizedContent | null {
  const devotional = devotionalTranslations[id];
  if (!devotional) return null;
  return devotional[locale] || devotional['en'] || null;
}
