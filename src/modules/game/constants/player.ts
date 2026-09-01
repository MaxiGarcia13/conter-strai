/** First-person player tuning — meters, seconds, radians. */
export const PLAYER_EYE_HEIGHT = 1.7;
/** Rest head-bone world Y for the default skin; shoulder booms pivot on the live anchor. */
export const DEFAULT_BODY_ANCHOR_Y = 1.57;
export const PLAYER_RADIUS = 0.4;
export const MOUSE_SENSITIVITY = 0.002;
export const PITCH_LIMIT = Math.PI / 2 - 0.01;
/** FPS look-down cap — prevents the camera from clipping into the player's own body. */
export const LOOK_PITCH_FLOOR = -0.6;

/** Soldier faces +Z at yaw 0; offset aligns model forward with camera −Z. */
export const MODEL_FORWARD_YAW_OFFSET = Math.PI;

/** Caps physics spikes after tab switches / hitches. */
export const MAX_FRAME_DELTA_SECONDS = 0.1;

/** Local player slot until round start assigns spawns per player. */
export { DEFAULT_TEAM as DEFAULT_LOCAL_TEAM, DEFAULT_PLAY_SKIN_ID } from './play-defaults';
export const DEFAULT_LOCAL_SPAWN_INDEX = 0;

/** Entity id used for the local player's hitbox and health tracking. */
export const LOCAL_PLAYER_ENTITY_ID = 'local-player';

/** Scene-graph name of the local soldier rig; aim raycasts skip it. */
export const LOCAL_PLAYER_ROOT_NAME = LOCAL_PLAYER_ENTITY_ID;
