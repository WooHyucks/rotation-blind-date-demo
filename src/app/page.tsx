"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Coffee, MapPin, Sparkles, Send, CheckCircle2 } from 'lucide-react';

function HomeContent() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [station, setStation] = useState('');
  const [otherStation, setOtherStation] = useState('');
  const [contact, setContact] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'flyer';

  const stations = ['상봉역', '망우역', '태릉입구역', '기타'];
  const ages = ['20대 초중반', '20대 후반', '30대 초반', '30대 중후반'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedLocation = station === '기타' ? otherStation : station;

    if (!selectedLocation || !contact || !ageGroup) {
      alert("모든 항목을 선택 및 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://qdvwwnylfhhevwzdfumm.supabase.co/functions/v1/social-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 임시 Authorization 헤더 추가 (실제 Supabase anon key로 교체 필요할 수 있음)
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_token_for_now'}`,
        },
        body: JSON.stringify({
          location: selectedLocation,
          contact,
          age_group: ageGroup,
          source: source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          alert('이미 신청된 연락처입니다.');
        } else {
          alert(data.error || '오류가 발생했습니다. 다시 시도해주세요.');
        }
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#3c47e4]/10 rounded-full blur-[80px]" />
        
        <div className="w-full max-w-[450px] bg-white border border-gray-100/50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(60,71,228,0.1)] relative z-10 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-10">
            <div className="w-20 h-20 bg-[#3c47e4]/10 rounded-full flex items-center justify-center mb-2 animate-in slide-in-from-bottom-4 duration-700">
              <CheckCircle2 className="w-10 h-10 text-[#3c47e4]" />
            </div>
            <h2 className="text-2xl font-bold leading-tight text-gray-800 tracking-tight">
              등록이 완료되었습니다!
            </h2>
            <p className="text-[15px] text-gray-500 leading-relaxed font-medium px-4">
              첫 모임 장소와 시간이 정해지면<br />
              남겨주신 연락처로 가장 먼저 소식 전해드릴게요.<br />
              <span className="block mt-4 text-[#3c47e4] font-semibold">곧 봬요! 😊</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-[#3c47e4]/20 selection:text-[#3c47e4]">
      {/* Premium Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[500px] bg-gradient-to-b from-[#3c47e4]/5 to-transparent blur-3xl rounded-[2.5rem] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-[450px] relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(60,71,228,0.08)] ring-1 ring-black/[0.02]">
          
          {/* Header Section */}
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-[#3c47e4]/[0.08] px-3.5 py-1.5 rounded-full mb-6 border border-[#3c47e4]/10">
              <span className="text-[10px] font-bold text-[#3c47e4] uppercase tracking-[0.2em]">
                Special Invitation
              </span>
            </div>
            
            <h1 className="text-[22px] font-bold leading-[1.3] text-gray-800 mb-8 tracking-tight">
              <span className="block text-3xl mb-3">☕️</span> 
              <span>[우리 동네] 5:5 로테이션 소개팅</span><br />
              <span className="text-[#3c47e4]">무료 참가권 등록</span>
            </h1>

            <div className="bg-gradient-to-br from-[#3c47e4]/10 to-[#3c47e4]/5 rounded-[1.5rem] p-6 text-left border border-[#3c47e4]/10 w-full relative overflow-hidden group hover:shadow-lg transition-all duration-500">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/40 blur-2xl rounded-full opacity-50 transition-transform duration-700 group-hover:scale-150"></div>
              
              <h2 className="text-[16px] font-bold text-[#3c47e4] flex items-center gap-2 mb-3 relative z-10">
                <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" strokeWidth={2.5} />
                <span>축하합니다! 🎉 무료 쿠폰 대상자입니다.</span>
              </h2>
              <p className="text-[13px] text-gray-600 leading-[1.6] relative z-10 font-medium">
                방금 받으신 쿠폰은 선착순 100명에게만 드리는 한정 혜택입니다. 지금 참여 의향을 남겨주시면, 모임 개최 시 만원의 참가비 없이 가장 먼저 초대해 드립니다.
              </p>
              <div className="mt-4 pt-4 border-t border-[#3c47e4]/10 relative z-10">
                <p className="text-[13px] font-bold text-[#3c47e4]">
                  딱 10초만 투자해서 내 집 앞에서의 설렘을 예약하세요!
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            
            {/* Q1. Station */}
            <div className="space-y-4">
              <label className="flex gap-3 text-[15px] font-bold text-gray-800 items-start">
                <div className="bg-[#3c47e4]/10 p-2.5 rounded-2xl h-fit shadow-sm border border-[#3c47e4]/5">
                  <MapPin className="w-5 h-5 text-[#3c47e4]" strokeWidth={2.5} />
                </div>
                <span className="mt-2.5 tracking-tight leading-snug">Q1. 선호하시는 역이나 동네가 어디인가요?</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {stations.map((s) => (
                  <label 
                    key={s} 
                    className={`relative flex items-center justify-center cursor-pointer rounded-full border-2 px-4 py-3.5 transition-all duration-300 font-medium select-none touch-manipulation ${
                      station === s 
                        ? 'border-[#3c47e4] bg-[#3c47e4]/[0.03] text-[#3c47e4] shadow-[0_8px_16px_-6px_rgba(60,71,228,0.2)]' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="station" 
                      value={s} 
                      checked={station === s} 
                      onChange={(e) => setStation(e.target.value)} 
                      className="hidden"
                    />
                    <span className="text-[14px] z-10">{s}</span>
                    {station === s && (
                      <div className="absolute inset-0 rounded-full bg-[#3c47e4]/5 animate-in zoom-in-50 duration-300" />
                    )}
                  </label>
                ))}
              </div>
              
              {/* Other station input */}
              <div className={`overflow-hidden transition-all duration-300 ${station === '기타' ? 'max-h-[100px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <input 
                  type="text" 
                  placeholder="예: 강남역, 홍대입구역" 
                  className="w-full rounded-full border-2 border-gray-100 bg-white px-5 py-3.5 shadow-sm text-base focus:outline-none focus:border-[#3c47e4] transition-all font-medium text-gray-800 placeholder-gray-400"
                  value={otherStation}
                  onChange={(e) => setOtherStation(e.target.value)}
                  required={station === '기타'}
                />
              </div>
            </div>

            {/* Q2. Contact Info */}
            <div className="space-y-4">
              <label className="flex gap-3 text-[15px] font-bold text-gray-800 items-start">
                <div className="bg-[#3c47e4]/10 p-2.5 rounded-2xl h-fit shadow-sm border border-[#3c47e4]/5">
                  <Send className="w-5 h-5 text-[#3c47e4]" strokeWidth={2.5} />
                </div>
                <span className="mt-2.5 tracking-tight leading-snug">Q2. 본인 확인 및 알림을 위한 인스타 ID (@계정) 또는 연락처</span>
              </label>
              <div className="mt-4 relative group">
                <input 
                  type="text" 
                  placeholder="예: @instagram_id 또는 010-0000-0000" 
                  className="w-full rounded-full border-2 border-gray-100 bg-white px-5 py-3.5 shadow-sm text-base focus:outline-none focus:border-[#3c47e4] transition-all duration-300 font-medium text-gray-800 placeholder-gray-400 z-10 relative"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  required
                />
                
                <div className={`mt-4 bg-[#fafafc] p-4 rounded-2xl border border-gray-100 transition-all duration-500 ease-out transform ${isFocused ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-90'}`}>
                  <p className="text-[12px] text-gray-500 leading-relaxed font-medium flex gap-2.5">
                    <span className="text-[#3c47e4] mt-[1px] opacity-80">※</span> 
                    <span>기재해주신 정보는 모임 확정 시 안내 문자(또는 DM) 전송과 <strong>본인 확인 용도</strong>로만 사용됩니다. 그 외의 마케팅 연락은 절대 드리지 않으니 안심하세요!</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Q3. Age */}
            <div className="space-y-4">
              <label className="flex gap-3 text-[15px] font-bold text-gray-800 items-start">
                <div className="bg-[#3c47e4]/10 p-2.5 rounded-2xl h-fit shadow-sm border border-[#3c47e4]/5 flex-shrink-0">
                  <Coffee className="w-5 h-5 text-[#3c47e4]" strokeWidth={2.5} />
                </div>
                <div className="mt-2.5 tracking-tight leading-snug">
                  <span>Q3. 연령대를 알려주세요</span>
                  <span className="text-gray-400 font-medium text-[13px] ml-2 block sm:inline mt-1 sm:mt-0">(매칭 참고용)</span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {ages.map((a) => (
                  <label 
                    key={a} 
                    className={`relative flex items-center justify-center text-center cursor-pointer rounded-full border-2 px-3 py-3.5 transition-all duration-300 font-medium select-none touch-manipulation ${
                      ageGroup === a 
                        ? 'border-[#3c47e4] bg-[#3c47e4]/[0.03] text-[#3c47e4] shadow-[0_8px_16px_-6px_rgba(60,71,228,0.2)]' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="age" 
                      value={a} 
                      checked={ageGroup === a} 
                      onChange={(e) => setAgeGroup(e.target.value)} 
                      className="hidden"
                    />
                    <span className="text-[13px] sm:text-[14px] z-10">{a}</span>
                    {ageGroup === a && (
                      <div className="absolute inset-0 rounded-full bg-[#3c47e4]/5 animate-in zoom-in-50 duration-300" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 pt-8 border-t border-gray-100 flex justify-center">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full relative group overflow-hidden rounded-full text-white font-bold p-4 shadow-[0_15px_30px_-10px_rgba(60,71,228,0.5)] transform transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLoading 
                    ? 'bg-[#3c47e4]/60 cursor-not-allowed' 
                    : 'bg-[#3c47e4] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(60,71,228,0.6)] active:scale-[0.98]'
                }`}
              >
                {!isLoading && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>}
                <span className="text-[15px] tracking-wide relative z-10">
                  {isLoading ? '신청 처리 중...' : '동네 카페에서 설레는 인연 시작하기'}
                </span>
                {!isLoading && <Send className="w-4 h-4 ml-1 relative z-10 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4">
        <div className="animate-pulse text-[#3c47e4] font-bold">로딩 중...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
