import {configureModel} from '../lib/l10-trust-fixtures.mjs';
import {captureLongModelCatalogAppearance,LONG_MODEL_CATALOG_ID} from '../lib/long-model-catalog-appearance.mjs';
export const journey={id:LONG_MODEL_CATALOG_ID,title:'Original long returned model ID unsaved input',features:['electronMigration'],needs:['accessibility','screen-recording'],model:'loopback',launch:{},timeoutMs:150000,owner:'Design reviewer'};
export async function run(t){await t.step('actual fixed long catalog GET and original unsaved planner input',{kind:'ui',features:['electronMigration']},async()=>{await configureModel(t);return captureLongModelCatalogAppearance(t)})}
