import React, { useEffect, useRef } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { useCommsStore, generateCommsFromLog } from '../../store/commsStore';

export default function CommsSyncController() {
  const globalEventLog = useWorldStore((s) => s.globalEventLog);
  const currentTick = useWorldStore((s) => s.currentTick);
  const pushCommsMessage = useCommsStore((s) => s.pushCommsMessage);

  // Initialize track ref to prevent parsing backlog events on game start, or backload them silently if preferred
  const isFirstLoadRef = useRef(true);
  const prevLogLengthRef = useRef(0);

  useEffect(() => {
    // Prevent backlog spam on first load
    if (isFirstLoadRef.current) {
      prevLogLengthRef.current = globalEventLog.length;
      isFirstLoadRef.current = false;
      return;
    }

    // Capture log clear situations
    if (globalEventLog.length <= 1) {
      prevLogLengthRef.current = globalEventLog.length;
      return;
    }

    // Check for newly added logs (since they are unshifted, index 0 is newest)
    if (globalEventLog.length > prevLogLengthRef.current) {
      const addedCount = globalEventLog.length - prevLogLengthRef.current;
      
      // Process new events from oldest to newest
      for (let i = addedCount - 1; i >= 0; i--) {
        const evt = globalEventLog[i];
        if (evt) {
          // Translate and feed to Comms Center
          const mappedMsg = generateCommsFromLog(evt.text, evt.severity as any, evt.tick);
          if (mappedMsg) {
            pushCommsMessage(mappedMsg);
          }
        }
      }
    }

    // Sync references
    prevLogLengthRef.current = globalEventLog.length;
  }, [globalEventLog, pushCommsMessage]);

  return null;
}
