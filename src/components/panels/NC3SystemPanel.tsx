import React, { useState } from 'react';
import { useNuclearStore } from '../../store/nuclearStore';
import { useDefconStore } from '../../store/defconStore';
import { useWorldStore } from '../../store/worldStore';
import { PanelFxShell } from '../fx/PanelFxShell';
import { 
  Radio, 
  Activity, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Power, 
  RefreshCw,
  Gauge
} from 'lucide-react';
import { NC3Channel } from '../../types';

export default function NC3SystemPanel() {
  const [activeTab, setActiveTab] = useState<'channels' | 'eam' | 'dead_hand'>('channels');
  const [eamStatusText, setEamStatusText] = useState<{ success: boolean; text: string } | null>(null);

  const currentTick = useWorldStore((s) => s.currentTick);
  const currentDefconLevel = useDefconStore((s) => s.currentDefconLevel);

  const {
    nc3System,
    deadHand,
    launchAuthority,
    decisionClockActive,
    decisionClockExpiryTick,
    attemptEAMTransmission,
    activateDeadHand,
    deactivateDeadHand
  } = useNuclearStore();

  const channelsList = Object.values(nc3System.channels);

  // Check if any channel integrity is under 40 or isDecapitationRisk is true
  const hasCriticalChannelAlert = channelsList.some(c => c.integrity < 40) || nc3System.isDecapitationRisk;

  // Manual EAM transmission attempt
  const handleAttemptEAM = () => {
    const success = attemptEAMTransmission(currentTick);
    if (success) {
      setEamStatusText({
        success: true,
        text: `[TICK ${currentTick}] EMERGENCY ACTION MESSAGE TRANSMITTED SUCCESSFULLY. Positive control confirmation received across redundant lines.`
      });
    } else {
      setEamStatusText({
        success: false,
        text: `[TICK ${currentTick}] TRANSMISSION FAILURE. NC3 degradation too severe. Signal blocked by active electromagnetic interference.`
      });
    }
    setTimeout(() => setEamStatusText(null), 8000);
  };

  // Channel readable details map
  const channelDetails: Record<NC3Channel, { name: string; desc: string }> = {
    NMCC_LANDLINE: {
      name: 'NMCC Hardline',
      desc: 'National Military Command Center Hardline'
    },
    STRATCOM_BROADCAST: {
      name: 'STRATCOM Broadcast',
      desc: 'Strategic Command ELF/VLF Broadcast'
    },
    AEHF_SATELLITE: {
      name: 'AEHF Satellite',
      desc: 'Advanced Extremely High Frequency Satellite'
    },
    VLF_SUBMARINE: {
      name: 'VLF Submarine',
      desc: 'Very Low Frequency Submarine Wire'
    },
    TACAMO_AIRCRAFT: {
      name: 'TACAMO Aircraft',
      desc: 'Take Charge and Move Out E-6B Aircraft'
    },
    EMP_HARDENED_WIRE: {
      name: 'EMP Hardened Wire',
      desc: 'Hardened Underground Landline Corridor'
    },
    DEAD_HAND_AUTO: {
      name: 'Perimeter Auto',
      desc: 'Perimeter Automated Launch System'
    }
  };

  return (
    <PanelFxShell 
      panelId="nc3_system" 
      relevantFxTypes={['NC3_DEGRADED', 'PERIMETER_ACTIVATION'] as any}
    >
      <div className="flex flex-col h-full text-gray-100 bg-[#0c0f12] border border-gray-800 rounded shadow-2xl overflow-hidden font-mono text-sm">
        
        {/* TOP SECRET Classification Banner */}
        <div className="bg-[#5c0d0d] text-white text-center py-1 text-xs font-bold tracking-widest border-b border-red-900 select-none">
          // TOP SECRET // SI // TK // NOFORN //
        </div>

        {/* Panel Header */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-[#11161d] border-b border-gray-800 gap-4">
          <div className="flex items-center gap-3">
            <Radio className={`w-6 h-6 ${hasCriticalChannelAlert ? "text-red-500 animate-pulse" : "text-emerald-400"}`} />
            <div>
              <h2 className="text-base font-semibold tracking-wide text-gray-200">
                NC3 SYSTEM STATUS — STRATCOM J6
              </h2>
              <p className="text-xs text-gray-500">Nuclear Command, Control, and Communications Constellation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded">
              <span className="text-xs text-gray-500">DEFCON:</span>{' '}
              <span className={`font-bold ${currentDefconLevel === 1 ? 'text-red-500' : currentDefconLevel === 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {currentDefconLevel}
              </span>
            </div>
            <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-gray-400">
              TICK {currentTick}
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-gray-800 bg-[#0e1217]">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-3 text-center border-b-2 font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'channels'
                ? 'border-red-600 bg-[#141b21] text-red-500'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>CHANNEL STATUS</span>
            {hasCriticalChannelAlert && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('eam')}
            className={`flex-1 py-3 text-center border-b-2 font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'eam'
                ? 'border-red-600 bg-[#141b21] text-red-500'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>EAM STATUS</span>
            {nc3System.eamQueueLength > 0 && (
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                {nc3System.eamQueueLength}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dead_hand')}
            className={`flex-1 py-3 text-center border-b-2 font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'dead_hand'
                ? 'border-red-600 bg-[#141b21] text-red-500'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>DEAD HAND</span>
            {deadHand.isActive && (
              <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold animate-pulse">
                ARMED
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#0a0d10]">
          
          {/* TAB 1: CHANNEL STATUS */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {(channelsList || []).map((ch) => {
                  const details = channelDetails[ch.channel] || { name: ch.channel, desc: '' };
                  const isLow = ch.integrity < 40;
                  const isMedium = ch.integrity >= 40 && ch.integrity < 70;
                  const integrityColor = isLow ? 'bg-red-600' : isMedium ? 'bg-amber-500' : 'bg-emerald-500';
                  const textColor = isLow ? 'text-red-400 font-bold' : isMedium ? 'text-amber-400' : 'text-emerald-400';

                  return (
                    <div 
                      key={ch.channel} 
                      className={`p-3 bg-[#11151a] border rounded transition-all ${
                        ch.integrity < 40 ? 'border-red-900/60 shadow-inner' : 'border-gray-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200 font-bold tracking-wide">
                              {details.name}
                            </span>
                            <span className="text-[10px] bg-gray-900 border border-gray-800 px-2 py-0.5 rounded text-gray-500 font-mono">
                              {ch.channel}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-sans block mt-0.5">
                            {details.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Active / Inactive status */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            ch.isActive 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                              : 'bg-gray-900 text-gray-500 border-gray-800'
                          }`}>
                            {ch.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                          
                          {/* Reliability */}
                          <span className="text-xs text-gray-400">
                            Rel: <strong className={textColor}>{ch.reliabilityPct}%</strong>
                          </span>
                        </div>
                      </div>

                      {/* Integrity bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Integrity:</span>
                          <span className={textColor}>{ch.integrity}/100</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${integrityColor}`}
                            style={{ width: `${ch.integrity}%` }}
                          />
                        </div>
                      </div>

                      {/* Degradation Flags & Last Transmission */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-900 text-xs">
                        <div className="flex gap-1.5">
                          {ch.degradedByEW && (
                            <span className="bg-red-950 border border-red-800 text-red-400 text-[10px] uppercase font-bold px-1 py-0.2 rounded-sm shadow-sm animate-pulse">
                              [EW]
                            </span>
                          )}
                          {ch.degradedByCyber && (
                            <span className="bg-red-950 border border-red-800 text-red-400 text-[10px] uppercase font-bold px-1 py-0.2 rounded-sm shadow-sm animate-pulse">
                              [CYBER]
                            </span>
                          )}
                          {ch.degradedByNuclearEMP && (
                            <span className="bg-red-950 border border-red-800 text-red-400 text-[10px] uppercase font-bold px-1 py-0.2 rounded-sm shadow-sm animate-pulse">
                              [EMP]
                            </span>
                          )}
                          {!ch.degradedByEW && !ch.degradedByCyber && !ch.degradedByNuclearEMP && (
                            <span className="text-gray-600 font-sans italic text-[11px]">No active interference detected</span>
                          )}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          Last Tx: <span className="text-gray-300">TICK {ch.lastSuccessfulTransmissionTick}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary card at the bottom of channels list */}
              <div className="p-4 bg-[#12171e] rounded border border-gray-800 space-y-3">
                <h3 className="font-semibold text-gray-300 text-xs uppercase tracking-wider flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  Consolidated NC3 Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-Gray-500 block">Overall Integrity</span>
                    <span className={`text-xl font-bold ${
                      nc3System.overallIntegrity >= 70 ? 'text-emerald-400' : nc3System.overallIntegrity >= 40 ? 'text-amber-400' : 'text-red-500'
                    }`}>
                      {nc3System.overallIntegrity}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Redundancy Rating</span>
                    <span className="text-xl font-bold text-gray-200">
                      {nc3System.communicationsRedundancyScore}/100
                    </span>
                  </div>
                </div>

                {nc3System.isDecapitationRisk && (
                  <div className="p-3 bg-red-950/40 border-l-4 border-red-600 rounded text-red-300 text-xs flex items-start gap-2.5 shadow-sm animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-red-400 tracking-wide">⚠ DECAPITATION WARNING</strong>
                      Secure command routes to secondary national hubs are compromised. Executive chain continuity is at high risk under first-strike conditions.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EAM STATUS */}
          {activeTab === 'eam' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#11151a] border border-gray-800 rounded space-y-4">
                <div className="border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-gray-300 text-xs uppercase tracking-wider">
                    Emergency Action Massage (EAM) Controller
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Redundant digital codes sent via ELF, satellites, and hardened relays to certify strategic order authorization.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-[#0e1114] p-3 rounded border border-gray-900">
                    <span className="text-[11px] text-gray-500 block uppercase">Queue Length</span>
                    <span className="text-lg font-bold text-gray-200">{nc3System.eamQueueLength}</span>
                  </div>
                  <div className="bg-[#0e1114] p-3 rounded border border-gray-900">
                    <span className="text-[11px] text-gray-500 block uppercase">Last Delivery Tick</span>
                    <span className="text-lg font-bold text-gray-200">
                      {nc3System.lastEAMDeliveredTick ? `TICK ${nc3System.lastEAMDeliveredTick}` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-[#0e1114] p-3 rounded border border-gray-900">
                    <span className="text-[11px] text-gray-500 block uppercase">EAM Success Prob</span>
                    <span className={`text-lg font-bold ${
                      nc3System.overallIntegrity >= 75 ? 'text-emerald-400' : nc3System.overallIntegrity >= 45 ? 'text-amber-400' : 'text-red-500'
                    }`}>
                      {nc3System.overallIntegrity}%
                    </span>
                  </div>
                </div>

                {/* Attempt Manual EAM Button */}
                <button
                  type="button"
                  onClick={handleAttemptEAM}
                  className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/40 border border-red-800 hover:border-red-600 text-red-200 font-bold transition-all rounded shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow text-red-400" />
                  ATTEMPT MANUAL EAM TRANSMISSION
                </button>

                {eamStatusText && (
                  <div className={`p-3 border rounded text-xs leading-relaxed ${
                    eamStatusText.success 
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' 
                      : 'bg-red-950/30 border-red-950 text-red-400'
                  }`}>
                    {eamStatusText.text}
                  </div>
                )}
              </div>

              {/* Live Decision Clock Block */}
              {decisionClockActive && decisionClockExpiryTick !== null && (
                <div className="p-4 bg-red-950/20 border border-red-900/60 rounded flex flex-col items-center justify-center text-center space-y-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="text-xs uppercase font-bold tracking-widest text-red-400">
                      STRATEGIC DECISION WINDOW
                    </span>
                  </div>

                  {decisionClockExpiryTick - currentTick > 0 ? (
                    <div className="space-y-1">
                      <div className={`text-4xl font-extrabold tracking-wide ${(decisionClockExpiryTick - currentTick) < 3 ? 'text-red-500 animate-ping' : 'text-red-400'}`}>
                        {Math.max(0, decisionClockExpiryTick - currentTick)} TICKS
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase">
                        REMAINDER BEFORE AUTOMATIC OPTION LOCKS
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-red-950 border border-red-900 text-red-200 uppercase font-bold text-xs select-none">
                      CLOCK EXPIRED — DEFAULT RETALIATION POSTURE ENGAGED
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEAD HAND */}
          {activeTab === 'dead_hand' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#11151a] border border-gray-800 rounded space-y-4">
                <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-300 text-xs uppercase tracking-wider">
                      Perimeter System Control Panel
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Autonomous Nuclear Retaliation Fail-Safe Network</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    deadHand.launchAuthorizedBySystem 
                      ? 'bg-red-950/60 text-red-400 border-red-700 animate-pulse' 
                      : deadHand.isActive 
                      ? 'bg-amber-950/40 text-amber-400 border-amber-800' 
                      : 'bg-gray-900 text-gray-500 border-gray-800'
                  }`}>
                    {deadHand.launchAuthorizedBySystem 
                      ? 'TRIGGERED' 
                      : deadHand.isActive 
                      ? 'ARMED' 
                      : 'INACTIVE'}
                  </span>
                </div>

                {/* Damage vs Threshold bar */}
                <div className="bg-[#0e1114] p-3 rounded border border-gray-900 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Seismic/Radiation Decapitation Signals:</span>
                    <span className="text-gray-300">{100 - nc3System.overallIntegrity}%</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden relative">
                    {/* Active Threshold Marker line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${deadHand.triggerThreshold}%` }}
                      title={`Trigger Threshold: ${deadHand.triggerThreshold}%`}
                    />
                    {/* Progress Fill bar */}
                    <div 
                      className={`h-full ${
                        (100 - nc3System.overallIntegrity) >= deadHand.triggerThreshold 
                          ? 'bg-red-600 animate-pulse' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${100 - nc3System.overallIntegrity}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-sans">
                    <span>Safe Readiness</span>
                    <span className="text-red-400">Trigger Threshold: {deadHand.triggerThreshold}%</span>
                  </div>
                </div>

                {/* Dead Hand Activations / Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0c0f12] p-2 border border-gray-900 rounded">
                    <span className="text-gray-500 block">Activation Tick:</span>
                    <span className="text-gray-300 font-bold">
                      {deadHand.activatedTick ? `TICK ${deadHand.activatedTick}` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-[#0c0f12] p-2 border border-gray-900 rounded">
                    <span className="text-gray-500 block">Seismic Intercepts:</span>
                    <span className="text-gray-300 font-bold">
                      {deadHand.countermeasuresAvailable ? 'STANDBY / ACTIVE' : 'DEGRADED / NONE'}
                    </span>
                  </div>
                </div>

                {/* Activator Buttons */}
                <div className="flex gap-3 pt-2">
                  {!deadHand.isActive ? (
                    <button
                      type="button"
                      disabled={currentDefconLevel > 2}
                      onClick={() => activateDeadHand(currentTick)}
                      className={`flex-1 py-2.5 px-4 font-bold border rounded transition-all flex items-center justify-center gap-2 text-xs select-none ${
                        currentDefconLevel <= 2
                          ? 'bg-amber-950/40 hover:bg-amber-900/40 border-amber-800 hover:border-amber-600 text-amber-200'
                          : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <Power className="w-4 h-4 text-amber-400" />
                      ACTIVATE PERIMETER
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={deactivateDeadHand}
                      className="flex-1 py-2.5 px-4 font-bold bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 text-gray-300 transition-all rounded text-xs select-none"
                    >
                      DEACTIVATE PERIMETER
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 font-sans border-t border-gray-900 pt-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>SYSTEM WARNING:</strong> Activation is irreversible until manually deactivated. 
                    System will automatically authorize autonomous missile launch to pre-designated targets if communications with high command are severed and nuclear detonation sensors trigger above threshold limits.
                  </span>
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </PanelFxShell>
  );
}
