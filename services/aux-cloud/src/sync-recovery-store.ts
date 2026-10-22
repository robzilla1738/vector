import {sql} from './db';
import type {RecoveryChallenge} from './sync-recovery-crypto';
export type RecoveryQuery=(text:string,parameters:unknown[])=>Promise<any[]>;
export type RecoveryActor={id:string;sessionId:string};
export class SyncRecoveryStore {
 constructor(private readonly query:RecoveryQuery=(text,values)=>sql.query(text,values) as Promise<any[]>){ }
 async state(actor:RecoveryActor){return (await this.query(`SELECT u.sync_generation,s.device_fingerprint,s.device_public_key,k.generation AS key_generation,k.revision AS key_revision,k.wrapped_key
 FROM aux_users u JOIN aux_sessions s ON s.user_id=u.id LEFT JOIN sync_keys k ON k.user_id=u.id
 WHERE u.id=$1 AND s.id=$2 AND u.deleted_at IS NULL AND s.revoked_at IS NULL AND s.expires_at>now() AND s.access_expires_at>now() AND s.platform='macos' AND s.device_fingerprint IS NOT NULL AND s.device_public_key IS NOT NULL`,[actor.id,actor.sessionId]))[0];}
 async head(actor:RecoveryActor,generation:number){return(await this.query('SELECT * FROM aux_sync_recovery_v2 WHERE user_id=$1 AND generation=$2 ORDER BY revision DESC LIMIT 1',[actor.id,generation]))[0];}
 async challenge(actor:RecoveryActor,id:string){return(await this.query('SELECT * FROM aux_sync_recovery_challenges_v2 WHERE id=$1 AND user_id=$2 AND session_id=$3',[id,actor.id,actor.sessionId]))[0];}
 async create(c:RecoveryChallenge){const rows=await this.query(`INSERT INTO aux_sync_recovery_challenges_v2(id,user_id,session_id,fingerprint,generation,operation,request_hash,nonce,expires_at)
 SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 FROM aux_users u JOIN aux_sessions s ON s.user_id=u.id
 WHERE u.id=$2 AND s.id=$3 AND u.sync_generation=$5 AND u.deleted_at IS NULL AND s.revoked_at IS NULL AND s.expires_at>now() AND s.access_expires_at>now() AND s.device_fingerprint=$4 AND s.platform='macos' RETURNING id`,[c.id,c.userId,c.sessionId,c.fingerprint,c.generation,c.operation,c.requestHash,c.nonce,c.expiresAt]);if(!rows.length)throw Error('RECOVERY_STATE_CHANGED');}
 async apply(actor:RecoveryActor,challenge:string,requestHash:string,options:{expectedRevision?:number;envelope?:unknown;commitment?:string;keyRevision?:number;capturedKey?:unknown;newWrappedKey?:unknown}={}){
 const rows=await this.query('SELECT aux_apply_sync_recovery_v2($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9::jsonb,$10::jsonb) AS response',[actor.id,actor.sessionId,challenge,requestHash,options.expectedRevision??0,options.envelope?JSON.stringify(options.envelope):null,options.commitment??null,options.keyRevision??null,options.capturedKey?JSON.stringify(options.capturedKey):null,options.newWrappedKey?JSON.stringify(options.newWrappedKey):null]);if(!rows[0]?.response)throw Error('RECOVERY_STATE_CHANGED');return rows[0].response;
 }
}
