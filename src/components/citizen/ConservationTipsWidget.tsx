import React, { useState, useEffect } from 'react';
import {
  Droplets,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  CheckCircle2,
  Play,
  Pause,
  Award,
  Zap,
  Leaf,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';

export interface ConservationTip {
  id: number;
  titleEn: string;
  titleMr: string;
  titleHi: string;
  descriptionEn: string;
  descriptionMr: string;
  descriptionHi: string;
  category: 'Kitchen' | 'Bathroom' | 'Outdoors' | 'Plumbing' | 'Harvesting' | 'Recycling';
  savedLitersPerDay: number;
  impactTag: string;
  actionTextEn: string;
  actionTextMr: string;
  actionTextHi: string;
}

export const CONSERVATION_TIPS: ConservationTip[] = [
  {
    id: 1,
    titleEn: 'Install Tap Aerators on Kitchen & Wash Basin Faucets',
    titleMr: 'वॉश बेसिन आणि स्वयंपाकघरातील नळांना एरेटर बसवा',
    titleHi: 'रसोई और वॉश बेसिन के नलों पर एरेटर (Aerator) लगाएं',
    descriptionEn: 'Aerators mix air into the water stream, cutting volume by 50% to 70% while maintaining high perceived pressure for washing.',
    descriptionMr: 'एरेटर पाण्यामध्ये हवा मिसळतात, ज्यामुळे पाण्याचा प्रवाह ५०% ते ७०% पर्यंत कमी होतो आणि पाण्याचा पुरेसा दाब कायम राहतो.',
    descriptionHi: 'एरेटर पानी के प्रवाह में हवा मिलाते हैं, जिससे पानी का बहाव 50% से 70% तक कम हो जाता है और पूरा प्रेशर बना रहता है।',
    category: 'Kitchen',
    savedLitersPerDay: 40,
    impactTag: 'High Impact • Low Cost',
    actionTextEn: 'Saves ~40 Liters/family daily',
    actionTextMr: 'दररोज सुमारे ४० लिटर बचत',
    actionTextHi: 'प्रतिदिन लगभग 40 लीटर बचत',
  },
  {
    id: 2,
    titleEn: 'Reuse RO Water Purifier Reject Discharge',
    titleMr: 'आरओ वॉटर प्युरिफायरचे वाया जाणारे पाणी पुन्हा वापरा',
    titleHi: 'आरओ वॉटर प्यूरीफायर का रिजेक्ट पानी दोबारा इस्तेमाल करें',
    descriptionEn: 'Standard domestic RO filters discard 3 liters for every 1 liter purified. Route the discharge pipe to a bucket for floor mopping, utensil pre-rinsing, or bathroom cleaning.',
    descriptionMr: 'घरगुती आरओ फिल्टर १ लिटर शुद्ध पाण्यामागे ३ लिटर पाणी बाहेर टाकतात. हे पाणी बादलीत गोळा करून फरशी पुसण्यासाठी किंवा भांडी धुण्यासाठी वापरा.',
    descriptionHi: 'घरेलू आरओ फिल्टर 1 लीटर शुद्ध पानी पर 3 लीटर पानी बहा देते हैं। इस पानी को बाल्टी में एकत्र कर पोंछा लगाने व सफाई में उपयोग करें।',
    category: 'Recycling',
    savedLitersPerDay: 45,
    impactTag: 'Zero-Cost Recycling',
    actionTextEn: 'Saves ~45 Liters daily',
    actionTextMr: 'दररोज सुमारे ४५ लिटर बचत',
    actionTextHi: 'प्रतिदिन लगभग 45 लीटर बचत',
  },
  {
    id: 3,
    titleEn: 'Bucket & Sponge Wash for Cars & Two-Wheelers',
    titleMr: 'गाड्या धुण्यासाठी नळाच्या पाईपऐवजी बादली व स्पंज वापरा',
    titleHi: 'गाड़ियों की धुलाई के लिए पाइप के बजाय बाल्टी और स्पंज का उपयोग करें',
    descriptionEn: 'Washing a car with an open garden hose consumes 250+ liters in 15 minutes. Using two buckets and a microfiber towel cuts this to only 30 liters.',
    descriptionMr: 'पाईप लावून गाडी धुतल्यास १५ मिनिटात २५० लिटरपेक्षा जास्त पाणी वाया जाते. २ बादल्या वापरल्यास केवळ ३० लिटरमध्ये काम होते.',
    descriptionHi: 'होज़ पाइप से कार धोने पर 15 मिनट में 250+ लीटर पानी बह जाता है। दो बाल्टी पानी और स्पंज से सिर्फ 30 लीटर में गाड़ी चमक जाती है।',
    category: 'Outdoors',
    savedLitersPerDay: 180,
    impactTag: 'Massive Waste Prevention',
    actionTextEn: 'Saves ~180 Liters per wash',
    actionTextMr: 'प्रत्येक धुलाईला १८० लिटर बचत',
    actionTextHi: 'हर धुलाई पर 180 लीटर बचत',
  },
  {
    id: 4,
    titleEn: 'Food-Color Test for Silent Flush Tank Leaks',
    titleMr: 'फ्लश टँक गळती शोधण्यासाठी अन्नाचा रंग (Food Color) चाचणी करा',
    titleHi: 'फ्लश टैंक के छिपे रिसाव को पकड़ने के लिए फूड कलर टेस्ट करें',
    descriptionEn: 'Add 5 drops of edible food coloring to your toilet cistern without flushing. If color appears in the bowl within 15 minutes, the flapper valve is leaking silently.',
    descriptionMr: 'टॉयलेटच्या फ्लश टाकीत अन्नाचा रंग टाका. १५ मिनिटांत तो भांड्यात दिसल्यास वाल्व्ह गळती आहे. तो बदलून शेकडो लिटर पाणी वाचवा.',
    descriptionHi: 'टॉयलेट सिस्टर्न में फूड कलर की 5 बूंदें डालें। 15 मिनट में अगर टॉयलेट बाउल में रंग दिखे, तो वाल्व लीक है जिसे तुरंत ठीक करें।',
    category: 'Plumbing',
    savedLitersPerDay: 120,
    impactTag: 'Leak Detection Hack',
    actionTextEn: 'Saves up to 120 Liters/day',
    actionTextMr: 'दररोज १२० लिटरपर्यंत बचत',
    actionTextHi: 'प्रतिदिन 120 लीटर तक बचत',
  },
  {
    id: 5,
    titleEn: 'Water Plants Early Morning or Late Evening',
    titleMr: 'झाडांना पाणी पहाटे किंवा संध्याकाळी उशिरा द्या',
    titleHi: 'पौधों को पानी सुबह-सुबह या शाम को देर से दें',
    descriptionEn: 'Midday watering leads to up to 40% loss through sun evaporation. Watering at dawn or dusk allows root systems to absorb moisture deeply.',
    descriptionMr: 'दुपारी पाणी दिल्यास ४०% पाणी उन्हामुळे बाष्पीभवन होऊन वाया जाते. सकाळी किंवा संध्याकाळी पाणी दिल्याने मुळांना पुरेसा ओलावा मिळतो.',
    descriptionHi: 'दोपहर की धूप में पानी देने से 40% पानी भाप बनकर उड़ जाता है। सुबह या शाम पानी देने से पौधों की जड़ों को पूरा पोषण मिलता है।',
    category: 'Harvesting',
    savedLitersPerDay: 25,
    impactTag: 'Smart Gardening',
    actionTextEn: 'Saves ~25 Liters daily',
    actionTextMr: 'दररोज सुमारे २५ लिटर बचत',
    actionTextHi: 'प्रतिदिन लगभग 25 लीटर बचत',
  },
  {
    id: 6,
    titleEn: 'Inspect Overhead Tank Float Valves for Overflow Prevention',
    titleMr: 'छतावरील पाण्याच्या टाकीचा फ्लोट व्हॉल्व्ह तपासा',
    titleHi: 'छत की पानी टंकी के फ्लोट वाल्व की नियमित जांच करें',
    descriptionEn: 'A malfunctioning mechanical ball-valve can silently spill 500+ liters onto the terrace daily during municipal supply hours in Mira-Bhayandar.',
    descriptionMr: 'बिघडलेला फ्लोट व्हॉल्व्ह पालिकेच्या पाणीपुरवठ्यावेळी शेकडो लिटर पाणी गच्चीवर वाया घालवतो. सेन्सर किंवा नवीन व्हॉल्व्ह बसवा.',
    descriptionHi: 'खराब फ्लोट वाल्व नगर निगम की जलापूर्ति के दौरान प्रतिदिन सैकड़ों लीटर पानी छत पर बहा देता है। इसे तुरंत दुरुस्त करें।',
    category: 'Plumbing',
    savedLitersPerDay: 200,
    impactTag: 'Municipal Critical',
    actionTextEn: 'Saves 200 to 500 L/day',
    actionTextMr: 'दररोज २०० ते ५०० लिटर बचत',
    actionTextHi: 'प्रतिदिन 200 से 500 लीटर बचत',
  },
  {
    id: 7,
    titleEn: 'Turn Off Tap While Brushing Teeth & Lathering Hands',
    titleMr: 'दात घासताना किंवा हात धुताना नळ बंद ठेवा',
    titleHi: 'दांत ब्रश करते समय या साबुन लगाते वक्त नल बंद रखें',
    descriptionEn: 'A running washbasin tap releases 6 to 9 liters of water every minute. Turning it off while brushing saves over 15 liters per person per day.',
    descriptionMr: 'वाहत्या नळातून मिनिटाला ६ ते ९ लिटर पाणी वाहून जाते. ब्रश करताना नळ बंद ठेवल्यास एका व्यक्तीमागे १५ लिटर पाणी वाचते.',
    descriptionHi: 'खुला नल प्रति मिनट 6 से 9 लीटर पानी बहा देता है। ब्रश करते समय नल बंद रखने से प्रति व्यक्ति 15 लीटर से अधिक बचत होती है।',
    category: 'Bathroom',
    savedLitersPerDay: 15,
    impactTag: 'Daily Habit Shift',
    actionTextEn: 'Saves ~15 Liters/person',
    actionTextMr: 'प्रत्येक व्यक्तीमागे १५ लिटर बचत',
    actionTextHi: 'प्रति व्यक्ति 15 लीटर बचत',
  },
];

export const ConservationTipsWidget: React.FC = () => {
  const { language } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pledges, setPledges] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('jalseva_pledged_tips');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });
  const [totalSavedLiters, setTotalSavedLiters] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jalseva_pledged_liters');
      return saved ? Number(saved) : 485;
    } catch {
      return 485;
    }
  });

  const tip = CONSERVATION_TIPS[currentIdx];
  const isPledged = pledges.includes(tip.id);

  // Auto-rotation every 8 seconds
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % CONSERVATION_TIPS.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % CONSERVATION_TIPS.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + CONSERVATION_TIPS.length) % CONSERVATION_TIPS.length);
  };

  const handleTogglePledge = () => {
    if (isPledged) {
      const updated = pledges.filter((id) => id !== tip.id);
      setPledges(updated);
      setTotalSavedLiters((prev) => Math.max(0, prev - tip.savedLitersPerDay));
      localStorage.setItem('jalseva_pledged_tips', JSON.stringify(updated));
      localStorage.setItem('jalseva_pledged_liters', String(totalSavedLiters - tip.savedLitersPerDay));
    } else {
      const updated = [...pledges, tip.id];
      const newLiters = totalSavedLiters + tip.savedLitersPerDay;
      setPledges(updated);
      setTotalSavedLiters(newLiters);
      localStorage.setItem('jalseva_pledged_tips', JSON.stringify(updated));
      localStorage.setItem('jalseva_pledged_liters', String(newLiters));

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0284c7', '#38bdf8', '#fd7e14', '#10b981'],
        });
      } catch {
        // ignore
      }
    }
  };

  const title = language === 'mr' ? tip.titleMr : language === 'hi' ? tip.titleHi : tip.titleEn;
  const description = language === 'mr' ? tip.descriptionMr : language === 'hi' ? tip.descriptionHi : tip.descriptionEn;
  const actionText = language === 'mr' ? tip.actionTextMr : language === 'hi' ? tip.actionTextHi : tip.actionTextEn;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-900 via-sky-900 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-sky-700/40">
      {/* Decorative ambient water ripple glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-60 h-60 bg-[#ea580c]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Droplets className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                {language === 'mr' ? 'जल संवर्धन केंद्र' : language === 'hi' ? 'जल संरक्षण केंद्र' : 'Conservation Tips Widget'}
              </span>
              <span className="text-[10px] bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded-full font-mono">
                Tip {currentIdx + 1} of {CONSERVATION_TIPS.length}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {language === 'mr' ? 'दैनंदिन पाणी बचत उपाय' : language === 'hi' ? 'दैनिक जल संरक्षण उपाय' : 'Daily Water Saving Practices'}
            </h3>
          </div>
        </div>

        {/* Community impact tally & rotation control */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-xs">
            <Award className="w-4 h-4 text-amber-300" />
            <span className="text-sky-200">
              {language === 'mr' ? 'नागरी संकल्प:' : language === 'hi' ? 'नागरिक संकल्प:' : 'My Pledged Savings:'}{' '}
              <strong className="text-white font-mono">{totalSavedLiters} L/day</strong>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/15">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 transition"
              title={autoRotate ? 'Pause Auto Rotation' : 'Resume Auto Rotation'}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 transition"
              title="Previous Tip"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 transition"
              title="Next Tip"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tip Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 text-xs font-bold border border-cyan-400/30 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              {tip.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-400/30">
              {tip.impactTag}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              💧 +{actionText}
            </span>
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
            {title}
          </h4>

          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action card: Pledge to Save */}
        <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col justify-between space-y-4 text-center sm:text-left">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-sky-200 font-bold block mb-1">
              {language === 'mr' ? 'संवर्धन प्रभाव' : language === 'hi' ? 'संरक्षण प्रभाव' : 'Civic Impact'}
            </span>
            <div className="text-3xl font-black text-amber-300 font-mono">
              ~{tip.savedLitersPerDay} <span className="text-sm font-sans font-medium text-white">L/day</span>
            </div>
            <p className="text-xs text-sky-200 mt-1">
              {language === 'mr'
                ? 'मीरा-भाईंदरच्या जलाशयांचे संवर्धन करा'
                : language === 'hi'
                ? 'मीरा-भायंदर के जलाशयों का संरक्षण करें'
                : 'Directly helps maintain MBMC reservoir reserves'}
            </p>
          </div>

          <button
            onClick={handleTogglePledge}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition transform active:scale-95 shadow-lg ${
              isPledged
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-[#ea580c] to-[#fd7e14] hover:from-[#c2410c] hover:to-[#ea580c] text-white shadow-orange-500/30'
            }`}
          >
            {isPledged ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>
                  {language === 'mr' ? 'संकल्प घेतला! (काढून टाका)' : language === 'hi' ? 'संकल्प लिया गया! (हटाएं)' : 'Pledged & Practicing!'}
                </span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-white fill-white" />
                <span>
                  {language === 'mr' ? 'मी हा नियम पाळतो!' : language === 'hi' ? 'मैं यह संकल्प लेता हूँ!' : 'I Practice This Habit!'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 mt-5 pt-3 border-t border-white/10">
        {CONSERVATION_TIPS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIdx(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIdx ? 'w-6 bg-cyan-300' : 'w-1.5 bg-white/30 hover:bg-white/60'
            }`}
            title={`Go to Tip ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
