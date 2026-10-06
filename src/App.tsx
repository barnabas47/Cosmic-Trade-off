import React, { useState, useMemo } from 'react';
import {
  SpacecraftConfiguration,
  JudgePreset,
  MissionScorecard,
} from './types/mission';
import { DESTINATIONS } from './data/destinations';
import { JUDGE_PRESETS } from './data/presets';
import { calculateMissionMetrics } from './physics/tradeoffs';
import { CompactMissionHeader } from './components/stitch/CompactMissionHeader';
import { CompactTelemetryTicker } from './components/stitch/CompactTelemetryTicker';
import { GamifiedMissionScoreHUD } from './components/stitch/GamifiedMissionScoreHUD';
import { Stitch3DAstrodynamicsViewport } from './components/stitch/Stitch3DAstrodynamicsViewport';
import { StitchSubsystemMatrix } from './components/stitch/StitchSubsystemMatrix';
import { SubsystemDetailDrawer, SubsystemDetailInfo } from './components/stitch/SubsystemDetailDrawer';
import { StitchFlightDirectorView } from './components/stitch/StitchFlightDirectorView';
import { CampaignBriefingModal } from './components/stitch/CampaignBriefingModal';
import { MissionDebriefModal } from './components/MissionDebriefModal';
import { sfx } from './utils/audio';

export const App: React.FC = () => {
  // 1-Click Judge Presets: starts with Europa Ice Explorer by default
  const [selectedPreset, setSelectedPreset] = useState<JudgePreset>(JUDGE_PRESETS[0]);
  const [config, setConfig] = useState<SpacecraftConfiguration>(JUDGE_PRESETS[0].config);
  const [activeTab, setActiveTab] = useState<'blueprint-lab' | 'flight-director'>('blueprint-lab');
  const [activeScorecard, setActiveScorecard] = useState<MissionScorecard | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState<boolean>(false);

  // Gamification state
  const [playerXp, setPlayerXp] = useState<number>(450);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Smart inspection drawer state
  const [inspectedSubsystem, setInspectedSubsystem] = useState<SubsystemDetailInfo | null>(null);

  // Compute live engineering physics metrics
  const metrics = useMemo(() => calculateMissionMetrics(config), [config]);
  const activeDest = DESTINATIONS[config.destinationId];

  // Calculate Rank from XP
  const playerRank = useMemo(() => {
    if (playerXp >= 1500) return 'CHIEF FLIGHT DIRECTOR';
    if (playerXp >= 1000) return 'LEAD MISSION ARCHITECT';
    if (playerXp >= 600) return 'SENIOR ASTRODYNAMICS ENGINEER';
    return 'FLIGHT DYNAMICS SPECIALIST';
  }, [playerXp]);

  const handleSelectPreset = (preset: JudgePreset) => {
    sfx.playClick();
    setSelectedPreset(preset);
    setConfig(preset.config);
    setPlayerXp((x) => x + 50);
  };

  const handleExecuteBurn = () => {
    sfx.playIgnition();
    setPlayerXp((x) => x + 100);
    setActiveTab('flight-director');
  };

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    sfx.enabled = next;
    if (next) sfx.playClick();
  };

  return (
    <div className="bg-surface-container-lowest font-body text-on-surface h-screen max-h-screen overflow-hidden flex flex-col relative selection:bg-primary-container selection:text-on-primary-container select-none">
      {/* 1. Background Grid & Ambient Aurora Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 space-grid opacity-50" />
      <div className="fixed top-[-15%] left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none bg-primary-container/10 blur-[130px] z-0" />
      <div className="fixed top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none bg-aurora-violet/10 blur-[140px] z-0" />

      {/* 2. Compact 56px Header with Presets, XP Badge, Audio Toggle & Tab Switcher */}
      <CompactMissionHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          sfx.playClick();
          setActiveTab(tab);
        }}
        selectedPresetId={selectedPreset.id}
        onSelectPreset={handleSelectPreset}
        playerXp={playerXp}
        playerRank={playerRank}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        onOpenCampaigns={() => setIsCampaignModalOpen(true)}
      />

      {/* 3. 36px Compact Telemetry Ticker Strip */}
      <CompactTelemetryTicker destination={activeDest} metrics={metrics} />

      {/* 4. Single-Screen Viewport Operational Area (Zero Window Scroll) */}
      <main className="flex-1 min-h-0 w-full p-2.5 flex flex-col overflow-hidden relative z-10 max-w-[1850px] mx-auto">
        {/* Tab 1: Blueprint Lab (3D Viewport on Left, HUD & Subsystems on Right) */}
        {activeTab === 'blueprint-lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full h-full min-h-0 overflow-hidden">
            {/* Left Column: Interactive 3D Astrodynamics Viewport (7 cols) */}
            <div className="lg:col-span-7 h-full min-h-0 flex flex-col">
              <Stitch3DAstrodynamicsViewport
                destination={activeDest}
                metrics={metrics}
                onExecuteBurn={handleExecuteBurn}
              />
            </div>

            {/* Right Column: Gamified Readiness HUD + Subsystem Matrix (5 cols) */}
            <div className="lg:col-span-5 h-full min-h-0 flex flex-col gap-2 overflow-hidden">
              <GamifiedMissionScoreHUD destination={activeDest} metrics={metrics} />
              <div className="flex-1 min-h-0 overflow-hidden">
                <StitchSubsystemMatrix
                  config={config}
                  onChangeConfig={setConfig}
                  metrics={metrics}
                  destination={activeDest}
                  onExecuteBurn={handleExecuteBurn}
                  onInspect={(info) => setInspectedSubsystem(info)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Flight Director Simulation Deck */}
        {activeTab === 'flight-director' && (
          <div className="w-full h-full min-h-0 overflow-hidden">
            <StitchFlightDirectorView
              config={config}
              metrics={metrics}
              destination={activeDest}
              onMissionCompleted={(scorecard) => {
                setActiveScorecard(scorecard);
                setPlayerXp((x) => x + 250);
              }}
              onBackToLab={() => {
                sfx.playClick();
                setActiveTab('blueprint-lab');
              }}
              onAddXp={(xp) => setPlayerXp((x) => x + xp)}
            />
          </div>
        )}
      </main>

      {/* 5. Smart Progressive Disclosure Subsystem Drawer */}
      <SubsystemDetailDrawer
        info={inspectedSubsystem}
        onClose={() => setInspectedSubsystem(null)}
      />

      {/* 6. Narrative NASA Campaigns Briefing Modal */}
      <CampaignBriefingModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSelectCampaign={handleSelectPreset}
        selectedPresetId={selectedPreset.id}
      />

      {/* 7. NASA Flight Evaluation Scorecard Modal */}
      <MissionDebriefModal
        scorecard={activeScorecard}
        onClose={() => setActiveScorecard(null)}
        onRestart={() => {
          setActiveScorecard(null);
          setActiveTab('blueprint-lab');
        }}
      />
    </div>
  );
};

export default App;
