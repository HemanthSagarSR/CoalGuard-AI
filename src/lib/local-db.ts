import { DEMO_DATA } from "./local-data";

export type Entity = Record<string, any>;

type State = {
  mines: Entity[];
  compliance: Entity[];
  inspections: Entity[];
  violations: Entity[];
  contractors: Entity[];
  alerts: Entity[];
  chatMessages: Entity[];
  auditLogs: Entity[];
};

const STORAGE_KEY = "coalguard-local-state-v1";
const USER_KEY = "coalguard-local-user-v1";
const CHANGE_EVENT = "coalguard-data-changed";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hash(str: string) {
  let value = 0;
  for (let i = 0; i < str.length; i++) value = ((value << 5) - value + str.charCodeAt(i)) | 0;
  return Math.abs(value).toString(16).padStart(8, "0");
}

function freshState(): State {
  const now = Date.now();
  const hydrate = (items: readonly Entity[], prefix: string) =>
    items.map((item) => {
      const copy: Entity = { ...item, _id: item._id || uid(prefix) };
      for (const key of ["date", "dueDate", "deadline", "completedAt", "resolutionDate", "createdAt", "updatedAt"]) {
        if (typeof copy[key] === "number") copy[key] = now + copy[key];
      }
      return copy;
    });

  const mines = hydrate(DEMO_DATA.mines, "mine");
  const compliance = hydrate(DEMO_DATA.compliance, "comp");
  const inspections = hydrate(DEMO_DATA.inspections, "inspection");
  const violations = hydrate(DEMO_DATA.violations, "violation");
  const contractors = hydrate(DEMO_DATA.contractors, "contractor");
  const alerts = hydrate(DEMO_DATA.alerts, "alert");

  const auditActions = [
    ["SYSTEM_INIT", "system", "seed", "System", "CoalGuard AI V1 demo environment initialized"],
    ["USER_LOGIN", "user", "demo-user", "Demo Admin", "Local demo login"],
    ["MINE_CREATED", "mine", "COL-E001", "System", "Jharia Eastern Colliery loaded"],
    ["INSPECTION_CREATED", "inspection", "INS-001", "Rajesh Kumar", "Safety inspection at Mine A"],
    ["VIOLATION_CREATED", "violation", "VIO-0001", "Rajesh Kumar", "Critical violation recorded"],
    ["COMPLIANCE_UPDATED", "compliance", "COMP-001", "System", "Gas monitoring requirement marked overdue"],
    ["VIOLATION_ESCALATED", "violation", "VIO-0011", "System", "Roof instability violation escalated"],
    ["RISK_SCORE_UPDATED", "mine", "COL-E001", "AI Engine", "Mine A risk score recalculated"],
    ["AUDIT_CHECK", "audit", "check-1", "System", "Audit integrity check — trail valid"],
  ];
  let prevHash = "GENESIS";
  const auditLogs = auditActions.map(([action, entity, entityId, userName, details], i) => {
    const payload = JSON.stringify({ action, entity, entityId, details, prevHash });
    const currentHash = hash(payload);
    const log = {
      _id: `audit-${i + 1}`, userId: "system", userName, action, entity, entityId,
      details, previousHash: prevHash, currentHash, timestamp: now - i * 86400000,
    };
    prevHash = currentHash;
    return log;
  });

  return { mines, compliance, inspections, violations, contractors, alerts, chatMessages: [], auditLogs };
}

let state: State | null = null;

function loadState(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw) as State;
  } catch {
    state = null;
  }
  if (!state) {
    state = freshState();
    persist();
  }
  return state;
}

function persist() {
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function getMine(id: string) {
  return loadState().mines.find((m) => m._id === id) ?? null;
}

function byMine(items: Entity[], mineId?: string) {
  return mineId ? items.filter((item) => item.mineId === mineId) : items;
}

export function queryData(name: string, args?: any): any {
  const s = loadState();
  switch (name) {
    case "mines.list": return s.mines;
    case "mines.get": return getMine(args?.mineId);
    case "mines.listByRisk": return [...s.mines].sort((a,b) => b.riskScore-a.riskScore);
    case "mines.getStats": {
      const total=s.mines.length;
      return {
        total,
        highRisk:s.mines.filter(m=>m.riskLevel==="HIGH"||m.riskLevel==="CRITICAL").length,
        criticalRisk:s.mines.filter(m=>m.riskLevel==="CRITICAL").length,
        totalOpenViolations:s.mines.reduce((n,m)=>n+m.openViolations,0),
        totalOverdue:s.mines.reduce((n,m)=>n+m.overdueActions,0),
      };
    }
    case "violations.list": return s.violations;
    case "violations.listByMine": return byMine(s.violations,args?.mineId);
    case "violations.getStats": {
      const all=s.violations;
      return {total:all.length,open:all.filter(v=>v.status==="OPEN").length,inProgress:all.filter(v=>v.status==="IN_PROGRESS").length,resolved:all.filter(v=>v.status==="RESOLVED").length,escalated:all.filter(v=>v.status==="ESCALATED").length,overdue:all.filter(v=>v.status!=="RESOLVED"&&v.deadline<Date.now()).length};
    }
    case "violations.listCorrectiveActions": return [];
    case "compliance.list": return s.compliance;
    case "compliance.listByMine": return byMine(s.compliance,args?.mineId);
    case "compliance.listByStatus": return s.compliance.filter(c=>c.status===args?.status);
    case "compliance.getStats": {
      const all=s.compliance;
      const completed=all.filter(c=>c.status==="COMPLETED").length;
      return {total:all.length,pending:all.filter(c=>c.status==="PENDING").length,inProgress:all.filter(c=>c.status==="IN_PROGRESS").length,completed,overdue:all.filter(c=>c.status==="OVERDUE").length,percentage:all.length?Math.round(completed/all.length*100):100};
    }
    case "inspections.list": return s.inspections;
    case "inspections.listByMine": return byMine(s.inspections,args?.mineId);
    case "inspections.getCount": return s.inspections.length;
    case "contractors.list": return s.contractors;
    case "contractors.listByMine": return byMine(s.contractors,args?.mineId);
    case "alerts.list": return s.alerts;
    case "alerts.listUnread": return s.alerts.filter(a=>!a.read).sort((a,b)=>b.createdAt-a.createdAt);
    case "alerts.getUnreadCount": return s.alerts.filter(a=>!a.read).length;
    case "audit.list": return [...s.auditLogs].sort((a,b)=>b.timestamp-a.timestamp);
    case "audit.verifyIntegrity": {
      const sorted=[...s.auditLogs].sort((a,b)=>a.timestamp-b.timestamp);
      let prev="GENESIS", valid=true, tamperedIndex=-1;
      for(let i=0;i<sorted.length;i++){
        const l=sorted[i];
        if(l.previousHash!==prev){valid=false;tamperedIndex=i;break;}
        const payload=JSON.stringify({action:l.action,entity:l.entity,entityId:l.entityId,details:l.details,prevHash:l.previousHash});
        if(hash(payload)!==l.currentHash){valid=false;tamperedIndex=i;break;}
        prev=l.currentHash;
      }
      return {valid,totalRecords:sorted.length,tamperedIndex:tamperedIndex>=0?tamperedIndex:null,status:valid?"AUDIT TRAIL VALID":`POSSIBLE TAMPERING DETECTED at record ${tamperedIndex+1}`};
    }
    case "chat.getMessages": return [...s.chatMessages].sort((a,b)=>a.createdAt-b.createdAt);
    case "chat.localAnswer": return localAnswer(args?.question || "");
    case "risk.calculateMineRisk": return calculateRisk(args?.mineId);
    case "users.currentUser": return currentUser();
    default: return [];
  }
}

function calculateRisk(mineId?: string) {
  const mine=getMine(mineId || "");
  if(!mine) return null;
  const s=loadState(), violations=byMine(s.violations,mineId), compliance=byMine(s.compliance,mineId), inspections=byMine(s.inspections,mineId), contractors=byMine(s.contractors,mineId);
  const safety=violations.filter(v=>v.category==="Safety").length;
  const env=violations.filter(v=>v.category==="Environment").length;
  const labour=violations.filter(v=>v.category==="Labour").length;
  const overdue=violations.filter(v=>v.status!=="RESOLVED"&&v.deadline<Date.now()).length;
  const open=violations.filter(v=>v.status!=="RESOLVED").length;
  const cats:Record<string,number>={}; violations.filter(v=>v.status!=="RESOLVED").forEach(v=>cats[v.category]=(cats[v.category]||0)+1);
  const recurring=Object.values(cats).filter(c=>c>=2).length;
  const recent=inspections.filter(i=>i.date>Date.now()-30*86400000).length;
  const avgContractor=contractors.length?contractors.reduce((n,c)=>n+c.riskScore,0)/contractors.length:0;
  const completed=compliance.filter(c=>c.status==="COMPLETED").length;
  const compPct=compliance.length?Math.round(completed/compliance.length*100):100;
  const score=Math.max(0,Math.min(100,Math.round(Math.min(safety*12,100)*.25+Math.min(overdue*15,100)*.20+Math.min(recurring*20,100)*.15+Math.min(env*15,100)*.10+Math.min(labour*20,100)*.10+avgContractor*.10+(100-compPct)*.10)));
  const level=score>80?"CRITICAL":score>60?"HIGH":score>30?"MEDIUM":"LOW";
  const reasons:string[]=[];
  if(overdue) reasons.push(`${overdue} overdue corrective actions`);
  if(recurring) reasons.push(`${recurring} recurring violation categories`);
  if(safety) reasons.push(`${safety} safety violations`);
  if(env) reasons.push(`${env} environmental violations`);
  if(compPct<70) reasons.push(`compliance at ${compPct}%`);
  if(avgContractor>60) reasons.push(`elevated contractor risk at ${Math.round(avgContractor)}`);
  return {mineId,riskScore:score,riskLevel:level,factors:{safetyViolations:safety,envViolations:env,labourViolations:labour,overdueActions:overdue,openViolations:open,recurringViolations:recurring,inspectionFrequency:recent,contractorRisk:Math.round(avgContractor),compliancePercentage:compPct},explanation:reasons.length?`${mine.name} is classified as ${level} because it has ${reasons.join(", ")}.`:`${mine.name} is performing well with no significant risk indicators.`,recommendedActions:score>80?["IMMEDIATE: Conduct comprehensive safety audit","Schedule emergency review meeting with mine management",...reasons.map(r=>`Address ${r}`)]:["Continue monitoring and maintain standards"]};
}


function localAnswer(question: string) {
  const s=loadState(), q=question.toLowerCase();
  const open=s.violations.filter(v=>v.status!=="RESOLVED");
  const overdue=s.compliance.filter(c=>c.status==="OVERDUE");
  if(q.includes("high risk")||q.includes("critical")||q.includes("attention")||q.includes("immediate")) {
    const critical=s.mines.filter(m=>m.riskLevel==="CRITICAL"), high=s.mines.filter(m=>m.riskLevel==="HIGH");
    return `${critical.length} mines are CRITICAL and ${high.length} are HIGH risk:\n\n${[...critical,...high].map(m=>`• ${m.name} — Risk ${m.riskScore} (${m.riskLevel}) — ${m.openViolations} violations, ${m.overdueActions} overdue actions`).join("\n")}\n\nRecommendation: Focus on CRITICAL mines first.`;
  }
  if(q.includes("overdue")||q.includes("compliance")) return `${overdue.length} compliance requirements are overdue:\n\n${overdue.map(c=>`• ${c.title} — ${c.category} (${c.priority})`).join("\n")}`;
  if(q.includes("violation")) {
    const byCat:Record<string,number>={}; open.forEach(v=>byCat[v.category]=(byCat[v.category]||0)+1);
    return `${open.length} open violations across all mines:\n\n${Object.entries(byCat).map(([cat,n])=>`• ${cat}: ${n}`).join("\n")}`;
  }
  const top=[...s.mines].sort((a,b)=>b.riskScore-a.riskScore)[0];
  return `The highest risk mine is ${top?.name} with a risk score of ${top?.riskScore}. There are ${open.length} open violations and ${overdue.length} overdue compliance items across all mines.`;
}

export function mutateData(name: string, args: any = {}) {
  const s=loadState();
  const now=Date.now();
  switch(name) {
    case "seed.seedAll":
      return "Data already seeded";
    case "alerts.markRead": {
      const a=s.alerts.find(x=>x._id===args.id); if(a)a.read=true; break;
    }
    case "alerts.markAllRead": s.alerts.forEach(a=>a.read=true); break;
    case "inspections.create": {
      const item={...args,_id:uid("inspection"),createdAt:now}; s.inspections.push(item); break;
    }
    case "inspections.updateStatus": {
      const x=s.inspections.find(i=>i._id===args.id); if(x)x.status=args.status; break;
    }
    case "violations.create": s.violations.push({...args,_id:uid("violation"),createdAt:now}); break;
    case "violations.updateStatus": {
      const x=s.violations.find(v=>v._id===args.id); if(x){x.status=args.status;if(args.status==="RESOLVED")x.resolutionDate=now;} break;
    }
    case "compliance.create": s.compliance.push({...args,_id:uid("comp"),createdAt:now,updatedAt:now}); break;
    case "compliance.updateStatus": {
      const x=s.compliance.find(c=>c._id===args.id); if(x){x.status=args.status;x.updatedAt=now;if(args.status==="COMPLETED")x.completedAt=now;} break;
    }
    case "mines.updateRiskScore": { const x=getMine(args.mineId); if(x){x.riskScore=args.riskScore;x.riskLevel=args.riskLevel;} break; }
    case "mines.updateStats": { const x=getMine(args.mineId); if(x){x.openViolations=args.openViolations;x.overdueActions=args.overdueActions;x.compliancePercentage=args.compliancePercentage;} break; }
    case "chat.saveMessage": s.chatMessages.push({...args,_id:uid("message"),createdAt:now}); break;
    case "audit.create": {
      const previous=s.auditLogs.length?s.auditLogs.reduce((a,b)=>a.timestamp>b.timestamp?a:b).currentHash:"GENESIS";
      const payload=JSON.stringify({action:args.action,entity:args.entity,entityId:args.entityId,details:args.details,prevHash:previous});
      s.auditLogs.push({...args,_id:uid("audit"),previousHash:previous,currentHash:hash(payload),timestamp:now}); break;
    }
    case "violations.createCorrectiveAction": break;
    default: break;
  }
  persist();
  return true;
}

export function currentUser() {
  try { const raw=localStorage.getItem(USER_KEY); return raw?JSON.parse(raw):null; } catch { return null; }
}
export function setCurrentUser(user: any) {
  if(user) localStorage.setItem(USER_KEY,JSON.stringify(user)); else localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}
export function resetDemoData() {
  state=freshState(); persist();
}
export function subscribeLocal(listener:()=>void) {
  const handler=()=>listener();
  window.addEventListener(CHANGE_EVENT,handler);
  return ()=>window.removeEventListener(CHANGE_EVENT,handler);
}
