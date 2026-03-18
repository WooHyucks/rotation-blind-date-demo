"use client";

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Coffee, MapPin, Sparkles, Send, CheckCircle2, Heart, ShieldCheck, Users } from 'lucide-react';
import * as amplitude from '@amplitude/analytics-browser';

function HomeContent() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [station, setStation] = useState('');
  const [otherStation, setOtherStation] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [variant, setVariant] = useState<'A' | 'B' | null>(null);

  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'flyer';

  useEffect(() => {
    amplitude.init('c38ab7ef5ec1b252254c304b37591477');

    let customUserId = localStorage.getItem('amplitude_user_id');
    if (!customUserId) {
      const hasQueryString = window.location.search.length > 1; 
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      customUserId = hasQueryString ? `당근유저_${randomNum}` : `일반유저_${randomNum}`;
      localStorage.setItem('amplitude_user_id', customUserId);
    }

    amplitude.setUserId(customUserId);
    amplitude.track('Page_View', { source: source });

    // A/B Test Logic
    let currentVariant = localStorage.getItem('ab_variant') as 'A' | 'B';
    if (!currentVariant) {
      currentVariant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('ab_variant', currentVariant);
    }
    setVariant(currentVariant);
    amplitude.track('view_variant', { variant: currentVariant });

  }, [source]);

  const stations = ['상봉역', '망우역', '구리역', '기타'];
  const ages = ['20대 초중반', '20대 후반', '30대 초반', '30대 중후반'];
  const genders = ['남성', '여성'];
  const contactMethods = [
    { id: 'instagram', label: '인스타 ID', placeholder: '예: @instagram_id' },
    { id: 'kakao', label: '카카오톡 ID', placeholder: '예: kakao_id' },
    { id: 'phone', label: '전화번호', placeholder: '예: 010-0000-0000' },
    { id: 'openkakao', label: '오픈카톡 링크', placeholder: '예: https://open.kakao.com/o/...' },
  ];


  const handleSelectStation = (val: string) => {
    setStation(val);
    amplitude.track('Select_Station', { value: val });
  };

  const handleSelectContactMethod = (val: string) => {
    setContactMethod(val);
    setContactValue('');
    amplitude.track('Select_ContactMethod', { value: val });
  };

  const handleSelectAge = (val: string) => {
    setAgeGroup(val);
    amplitude.track('Select_AgeGroup', { value: val });
  };

  const handleSelectGender = (val: string) => {
    setGender(val);
    amplitude.track('Select_Gender', { value: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLocation = station === '기타' ? otherStation : station;
    const isValidContact = contactValue.trim();

    if (!selectedLocation || !isValidContact || !ageGroup || !gender) {
      alert("모든 항목을 입력 및 선택해주세요.");
      amplitude.track('Submit_Form_Fail_Validation', {
        reason: 'fields_missing',
        station: !!station,
        contactMethod: !!contactMethod,
        contactValue: !!contactValue.trim(),
        ageGroup: !!ageGroup,
        gender: !!gender
      });
      return;
    }

    const contactString = `[${contactMethod}] ${contactValue.trim()}`;
    
    amplitude.track('Submit_Form_Attempt', {
      location: selectedLocation,
      contactMethod: contactMethod,
      ageGroup: ageGroup,
      gender: gender,
      source: source,
      variant: variant
    });

    setIsLoading(true);

    try {
      const response = await fetch('https://qdvwwnylfhhevwzdfumm.supabase.co/functions/v1/social-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_token_for_now'}`,
        },
        body: JSON.stringify({
          location: selectedLocation,
          contact: contactString,
          age_group: ageGroup,
          gender: gender,
          source: source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          alert('이미 신청된 연락처입니다.');
          amplitude.track('Submit_Form_Fail', { reason: 'conflict', status: 409 });
        } else {
          alert(data.error || '오류가 발생했습니다. 다시 시도해주세요.');
          amplitude.track('Submit_Form_Fail', { reason: 'api_error', error: data.error, status: response.status });
        }
        return;
      }

      amplitude.track('Submit_Form_Success', {
        location: selectedLocation,
        contactMethod: contactMethod,
        ageGroup: ageGroup,
        gender: gender,
        source: source,
        variant: variant
      });
      setIsSubmitted(true);
    } catch (error) {
      alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white sm:bg-[#fafafc] flex items-center justify-center sm:p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#3c47e4]/10 rounded-full blur-[80px]" />
        
        <div className="w-full max-w-[450px] bg-white border-0 sm:border border-gray-100/50 rounded-none sm:rounded-[2.5rem] p-6 sm:p-12 shadow-none sm:shadow-[0_20px_40px_-15px_rgba(60,71,228,0.1)] relative z-10 animate-in zoom-in-95 duration-500 min-h-screen sm:min-h-fit flex flex-col justify-center">
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
    <div className="min-h-screen bg-white sm:bg-[#fafafc] flex items-center justify-center sm:p-4 font-sans relative overflow-hidden selection:bg-[#3c47e4]/20 selection:text-[#3c47e4]">
      {/* Premium Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[500px] bg-gradient-to-b from-[#3c47e4]/5 to-transparent blur-3xl rounded-[2.5rem] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-[450px] relative z-10 animate-in fade-in sm:slide-in-from-bottom-4 duration-500 min-h-screen sm:min-h-fit flex flex-col">
        
        {/* Main Content Card */}
        <div className="bg-white/95 sm:bg-white/80 backdrop-blur-xl border-0 sm:border border-white/40 rounded-none sm:rounded-[2.5rem] p-5 sm:p-10 shadow-none sm:shadow-[0_20px_60px_-15px_rgba(60,71,228,0.08)] ring-0 sm:ring-1 ring-black/[0.02] flex-grow flex flex-col justify-center">
          
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

          {/* 💖 실시간 신청 현황 */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
            <div className="bg-gradient-to-br from-rose-50/50 to-white rounded-3xl p-5 border border-rose-100/50 shadow-[0_12px_24px_-10px_rgba(225,29,72,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-300/10 rounded-full blur-2xl -mr-10 -mt-10" />
              
              <div className="flex items-center justify-center gap-1.5 mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[12px] font-extrabold text-rose-500 tracking-wider">
                  {variant === 'A' ? "현재 지역 실시간 매칭 현황입니다." : "실시간 신청 현황"}
                </span>
              </div>

              {variant === 'A' ? (
                /* =================== VERSION A: Range (초간소화 고급 1단 피드) =================== */
                <div className="space-y-3 relative z-10 w-full text-left">
                  {/* 여성 매칭 현황 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-rose-100/60 shadow-[0_4px_12px_rgba(225,29,72,0.01)] flex flex-col gap-2 relative">
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-75">
                      <div className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                      <span className="text-[9px] text-gray-500 font-bold tracking-tight">2명 성비 조절 중</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-rose-500" strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 tracking-tight">여성 매칭 유저</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" strokeWidth={3} />
                          <span className="text-[12px]  font-semibold text-gray-800 tracking-tight">20대 초중반</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 남성 매칭 현황 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/60 shadow-[0_4px_12px_rgba(59,130,246,0.01)] flex flex-col gap-3 relative">
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-75">
                      <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-[9px] text-gray-500 font-bold tracking-tight">3명 프로필 검토 중</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-grow">
                        <span className="text-[10px] font-bold text-gray-400 tracking-tight">남성 매칭 유저</span>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" strokeWidth={3} />
                            <span className="text-[12px] font-semibold text-gray-800 tracking-tight">180cm 중반 <span className="text-gray-300 mx-1">/</span> 20대 중후반</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" strokeWidth={3} />
                            <span className="text-[12px] font-semibold text-gray-800 tracking-tight">170cm 후반 <span className="text-gray-300 mx-1">/</span> 20대 중후반</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* =================== VERSION B: Counter (정량 카운트 단일화) =================== */
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {/* 여성 신청 현황 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-rose-100/60 flex flex-col items-center shadow-sm">
                    <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center mb-1.5">
                      <Heart className="w-4 h-4 text-rose-500" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mb-2">여성 신청 현황</span>
                    
                    <div className="flex w-full divide-x divide-rose-100/30 mt-1">
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[9px] text-gray-400 font-bold mb-0.5">확정</span>
                        <p className="text-[16px] font-black text-rose-500">1<span className="text-[11px] font-bold text-gray-600 ml-0.5">명</span></p>
                        <span className="text-[8px] text-gray-500 font-bold mt-1 bg-rose-50/70 px-1 py-0.5 rounded leading-none scale-[0.9] transform origin-top">(20대 초중반)</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center opacity-60">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <span className="text-[9px] text-gray-400 font-bold">대기</span>
                          <div className="flex gap-[1.5px] items-center mt-0.5">
                            <div className="w-[2px] h-[2px] rounded-full bg-gray-400 animate-bounce duration-300" />
                            <div className="w-[2px] h-[2px] rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                            <div className="w-[2px] h-[2px] rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                          </div>
                        </div>
                        <p className="text-[15px] font-black text-gray-700">2<span className="text-[10px] font-medium text-gray-500 ml-0.5">명</span></p>
                        <span className="text-[8px] text-rose-400 font-bold tracking-tight mt-0.5">검토 중</span>
                      </div>
                    </div>
                  </div>

                  {/* 남성 신청 현황 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/60 flex flex-col items-center shadow-sm">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-1.5">
                      <Users className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mb-2">남성 신청 현황</span>
                    
                    <div className="flex w-full divide-x divide-blue-100/30 mt-1">
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[9px] text-gray-400 font-bold mb-0.5">확정</span>
                        <p className="text-[16px] font-black text-blue-500">2<span className="text-[11px] font-bold text-gray-600 ml-0.5">명</span></p>
                        <span className="text-[7.5px] text-gray-500 font-bold mt-1 bg-blue-50/70 px-1 py-0.5 rounded text-center leading-[1.2] tracking-tighter w-[95%] overflow-hidden text-ellipsis">(20대 후반, 20대 중후반)</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center opacity-60">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <span className="text-[9px] text-gray-400 font-bold">대기</span>
                          <div className="flex gap-[1.5px] items-center mt-0.5">
                            <div className="w-[2px] h-[2px] rounded-full bg-gray-400 animate-bounce duration-300" />
                            <div className="w-[2px] h-[2px] rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                            <div className="w-[2px] h-[2px] rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                          </div>
                        </div>
                        <p className="text-[15px] font-black text-gray-700">3<span className="text-[10px] font-medium text-gray-500 ml-0.5">명</span></p>
                        <span className="text-[8px] text-blue-400 font-bold tracking-tight mt-0.5">매칭 대기</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3.5 border-t border-rose-100/50 flex items-start justify-center gap-1.5 px-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="text-[10px] text-gray-500 font-semibold text-center leading-[1.5] tracking-tight">
                  {variant === 'A' ? (
                    "성비와 매너를 고려해 정중하게 선별 매칭 중입니다."
                  ) : (
                    <>현재 성비에 맞춰 순차적으로 초대장을 발송하고 있습니다. 지금 신청하시면 <strong className="text-rose-500 font-bold">우선 순위로 검토</strong>됩니다!</>
                  )}
                </div>
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
                      onChange={(e) => handleSelectStation(e.target.value)} 
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
                <div className="bg-[#3c47e4]/10 p-2.5 rounded-2xl h-fit shadow-sm border border-[#3c47e4]/5 flex-shrink-0">
                  <Send className="w-5 h-5 text-[#3c47e4]" strokeWidth={2.5} />
                </div>
                <div className="mt-2.5 tracking-tight leading-snug">
                  <span>Q2. 어떤 방식으로 연락을 받으시겠어요?</span>
                </div>
              </label>

              {/* 안심 문구 디자인 */}
              <div className="bg-[#3c47e4]/[0.03] p-3.5 rounded-2xl border border-[#3c47e4]/5 flex items-start gap-2.5 transition-all duration-300">
                <ShieldCheck className="w-4 h-4 text-[#3c47e4] mt-0.5" />
                <p className="text-[12px] text-gray-600 font-medium leading-[1.6]">
                  정보는 전송 및 본인 확인용으로만 사용되며 <strong>안전하게 관리</strong>됩니다. 안심하세요!
                </p>
              </div>

              {/* Contact Method Selection Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {contactMethods.map((m) => (
                  <label 
                    key={m.id} 
                    className={`relative flex items-center justify-center text-center cursor-pointer rounded-full border-2 px-3 py-3.5 transition-all duration-300 font-medium select-none touch-manipulation flex-grow ${
                      contactMethod === m.id 
                        ? 'border-[#3c47e4] bg-[#3c47e4]/[0.03] text-[#3c47e4] shadow-[0_8px_16px_-6px_rgba(60,71,228,0.2)]' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="contactMethod" 
                      value={m.id} 
                      checked={contactMethod === m.id} 
                      onChange={(e) => handleSelectContactMethod(e.target.value)} 
                      className="hidden"
                    />
                    <span className="text-[13px] sm:text-[14px] z-10">{m.label}</span>
                    {contactMethod === m.id && (
                      <div className="absolute inset-0 rounded-full bg-[#3c47e4]/5 animate-in zoom-in-50 duration-300" />
                    )}
                  </label>
                ))}
              </div>

              {/* Conditional Input based on selection */}
              {contactMethod && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    placeholder={contactMethods.find(m => m.id === contactMethod)?.placeholder} 
                    className="w-full rounded-full border-2 border-gray-100 bg-white px-5 py-3.5 shadow-sm text-base focus:outline-none focus:border-[#3c47e4] transition-all duration-300 font-medium text-gray-800 placeholder-gray-400"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    onBlur={() => contactValue.trim() && amplitude.track('Type_ContactValue_Blur', { method: contactMethod, length: contactValue.trim().length })}
                    required
                  />
                </div>
              )}
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
                      onChange={(e) => handleSelectAge(e.target.value)} 
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

            {/* Q4. Gender */}
            <div className="space-y-4">
              <label className="flex gap-3 text-[15px] font-bold text-gray-800 items-start">
                <div className="bg-[#3c47e4]/10 p-2.5 rounded-2xl h-fit shadow-sm border border-[#3c47e4]/5 flex-shrink-0">
                  <Heart className="w-5 h-5 text-[#3c47e4]" strokeWidth={2.5} />
                </div>
                <div className="mt-2.5 tracking-tight leading-snug">
                  <span>Q4. 성별을 알려주세요</span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {genders.map((g) => (
                  <label 
                    key={g} 
                    className={`relative flex items-center justify-center text-center cursor-pointer rounded-full border-2 px-3 py-3.5 transition-all duration-300 font-medium select-none touch-manipulation ${
                      gender === g 
                        ? 'border-[#3c47e4] bg-[#3c47e4]/[0.03] text-[#3c47e4] shadow-[0_8px_16px_-6px_rgba(60,71,228,0.2)]' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="gender" 
                      value={g} 
                      checked={gender === g} 
                      onChange={(e) => handleSelectGender(e.target.value)} 
                      className="hidden"
                    />
                    <span className="text-[14px] z-10">{g}</span>
                    {gender === g && (
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
