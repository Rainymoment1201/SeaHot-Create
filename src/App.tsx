import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Edit2, SlidersHorizontal, Loader2, Check } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');
  const [intro, setIntro] = useState('');
  
  // Advanced flow state
  const [isAdvancedFlow, setIsAdvancedFlow] = useState(false);
  const [advancedStep, setAdvancedStep] = useState(1);
  const [advancedFirstMessage, setAdvancedFirstMessage] = useState('');
  const [characterSetting, setCharacterSetting] = useState('');

  // Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  // PRD state
  const [prdContent, setPrdContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const currentStepId = isAdvancedFlow ? `advanced-${advancedStep}` : `step-${step}`;

  useEffect(() => {
    setPrdContent(''); // Clear while loading
    fetch(`/api/prd/${currentStepId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.content) {
          setPrdContent(data.content);
        }
      })
      .catch(err => console.error("Failed to load PRD:", err));
  }, [currentStepId]);

  const handleSavePrd = async () => {
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      await fetch(`/api/prd/${currentStepId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prdContent })
      });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('Error saving');
    }
    setIsSaving(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1500);
    }
  };

  const isContinueDisabled = () => {
    if (isAdvancedFlow) {
      return false;
    } else {
      if (step === 1) return name.trim() === '';
      if (step === 2) return !gender;
      if (step === 3) return !image;
      if (step === 4) return firstMessage.trim() === '';
      return false;
    }
  };

  const handleNext = () => {
    if (isContinueDisabled()) return;
    if (!isAdvancedFlow) {
      if (step < 5) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (isAdvancedFlow) {
      setIsAdvancedFlow(false);
    } else {
      if (step > 1) setStep(step - 1);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    // Reset state to initial
    setStep(1);
    setIsAdvancedFlow(false);
    setAdvancedStep(1);
    setName('');
    setGender('Male');
    setImage(null);
    setFirstMessage('');
    setIntro('');
    setAdvancedFirstMessage('');
    setCharacterSetting('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex items-center justify-center p-4 sm:p-6 gap-6 lg:gap-10 font-sans selection:bg-pink-200">
      
      {/* iPhone Frame */}
      <div className="w-[340px] h-[90%] max-h-[800px] min-h-[600px] bg-white rounded-[2.5rem] border-[12px] border-gray-900 relative shadow-2xl shrink-0 overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-36 mx-auto z-50"></div>
        
        {/* App Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white relative custom-scrollbar">
          <div className="w-full flex flex-col min-h-full p-6 pt-10 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleCancel}
            className="flex items-center justify-center px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {!isAdvancedFlow ? (
            [1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step === s ? 'bg-pink-400' : 'bg-gray-100'}`}
              />
            ))
          ) : (
            [1].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 bg-pink-400`}
              />
            ))
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {!isAdvancedFlow && step === 1 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-bold mb-3">Name</h1>
              <p className="text-gray-500 mb-10">First, Choose A Name For Your AI Creation</p>
              
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Add A Name"
                  maxLength={20}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-5 pr-16 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-lg placeholder:text-gray-400"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  {name.length}/20
                </span>
              </div>
            </div>
          )}

          {!isAdvancedFlow && step === 2 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-bold mb-10">Gender</h1>
              
              <div className="flex flex-col gap-4">
                {['Male', 'Female', 'Others'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      gender === g 
                        ? 'border-pink-400 bg-pink-50/50' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <span className={`text-lg font-medium ${gender === g ? 'text-pink-500' : 'text-gray-700'}`}>
                      {g}
                    </span>
                    {gender === g && (
                      <div className="w-6 h-6 rounded-full bg-pink-400 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isAdvancedFlow && step === 3 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-bold mb-3">Profile Image</h1>
              <p className="text-gray-500 mb-10">Add An Image To Use For Your Chat AI</p>
              
              <div 
                className={`relative aspect-square w-full max-w-[300px] mx-auto rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all duration-300
                  ${image ? 'border-transparent shadow-sm' : 'border-gray-300 hover:border-pink-400 bg-gray-50 hover:bg-pink-50/50'}`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center text-pink-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3" />
                    <span className="font-medium">Uploading...</span>
                  </div>
                ) : image ? (
                  <img src={image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-4 opacity-60" />
                    <span className="font-medium text-gray-500">Add Image</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          )}

          {!isAdvancedFlow && step === 4 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-bold mb-3">Introduction</h1>
              <p className="text-gray-500 mb-10">Set up the public introduction of the characters</p>
              
              <div className="relative">
                <textarea 
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder={`Write a short introduction for ${name || 'your AI'}...`}
                  maxLength={200}
                  className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-6 pb-12 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-lg placeholder:text-gray-400 resize-none min-h-[200px]"
                />
                <span className="absolute bottom-6 right-6 text-sm text-gray-400 font-medium">
                  {firstMessage.length}/200
                </span>
              </div>
            </div>
          )}

          {!isAdvancedFlow && step === 5 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-bold mb-3">{name || 'AI Name'}</h1>
              <p className="text-gray-500 mb-10">Add a short intro to describe your AI, and publish it!</p>
              
              <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden flex flex-col shadow-sm">
                <div className="aspect-square w-full bg-gray-50 relative">
                  {image ? (
                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <span className="font-bold text-xl text-gray-900">{name || 'AI Name'}</span>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-medium pl-1 text-gray-700">{name || 'AI'}</span>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-sm">
                        {image ? (
                          <img src={image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm p-3 relative shadow-sm">
                        <textarea 
                          value={intro}
                          onChange={(e) => setIntro(e.target.value)}
                          placeholder="增加开场白"
                          maxLength={20}
                          className="w-full bg-transparent resize-none focus:outline-none min-h-[40px] text-gray-800 placeholder:text-gray-400 text-sm"
                        />
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                          <button className="flex items-center text-xs font-medium text-gray-500 hover:text-pink-400 transition-colors">
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <span className="text-xs text-gray-400 font-medium">
                            {intro.length}/20
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAdvancedFlow && advancedStep === 1 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-bold mb-3">高级设置</h1>
              <p className="text-gray-500 mb-8">Add more detailed information about the character's background and attributes.</p>
              
              <div className="flex flex-col gap-6 bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-sm">
                    {image ? (
                      <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{gender}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="relative">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Introduction</h4>
                    <textarea 
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                      placeholder="Add an introduction..."
                      maxLength={200}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400 resize-none min-h-[80px]"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium">
                      {firstMessage.length}/200
                    </span>
                  </div>
                  
                  <div className="relative">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">First Message</h4>
                    <textarea 
                      value={advancedFirstMessage}
                      onChange={(e) => setAdvancedFirstMessage(e.target.value)}
                      placeholder="Write the first message here..."
                      maxLength={100}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400 resize-none min-h-[80px]"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium">
                      {advancedFirstMessage.length}/100
                    </span>
                  </div>

                  <div className="relative">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Character Setting</h4>
                    <textarea 
                      value={characterSetting}
                      onChange={(e) => setCharacterSetting(e.target.value)}
                      placeholder="Describe your character here..."
                      maxLength={1000}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400 resize-none min-h-[120px]"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium">
                      {characterSetting.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col gap-3 pb-8">
          {!isAdvancedFlow && step < 5 ? (
            <button 
              onClick={handleNext}
              disabled={isContinueDisabled()}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-sm ${
                isContinueDisabled() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-pink-400 hover:bg-pink-500 text-white'
              }`}
            >
              Continue
            </button>
          ) : (
            <button 
              disabled={isContinueDisabled()}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-sm ${
                isContinueDisabled() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-pink-400 hover:bg-pink-500 text-white'
              }`}
            >
              Publish
            </button>
          )}
          
          <div className="flex gap-3">
            {((!isAdvancedFlow && step > 1) || isAdvancedFlow) && (
              <button 
                onClick={handleBack}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 text-gray-700 font-bold transition-all active:scale-[0.98]"
              >
                Back
              </button>
            )}
            {!isAdvancedFlow && step === 5 && (
              <button 
                onClick={() => {
                  setIsAdvancedFlow(true);
                  setAdvancedStep(1);
                  if (intro && !advancedFirstMessage) {
                    setAdvancedFirstMessage(intro);
                  }
                }}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 text-gray-700 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Advanced
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-[320px] overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-500 font-medium">Exiting the form may lose your progress.</p>
            </div>
            <div className="flex">
              <button 
                onClick={confirmCancel}
                className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Yes
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-4 font-bold text-pink-500 hover:bg-pink-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* PRD Editor */}
      <div className="flex-1 max-w-4xl h-[90%] max-h-[800px] min-h-[600px] bg-white rounded-[2rem] shadow-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              PRD Document <span className="text-gray-400 text-lg ml-2 font-medium">({isAdvancedFlow ? 'Review Details' : `Step ${step}`})</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Write your product requirements for this specific page here.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-pink-500">{saveStatus}</span>
            <button 
              onClick={handleSavePrd}
              disabled={isSaving}
              className="px-6 py-2.5 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Save PRD
            </button>
          </div>
        </div>
        <textarea
          value={prdContent}
          onChange={(e) => setPrdContent(e.target.value)}
          placeholder="Start writing your PRD here..."
          className="flex-1 w-full p-8 resize-none focus:outline-none text-gray-700 leading-relaxed text-lg custom-scrollbar"
        />
      </div>
    </div>
  );
}
