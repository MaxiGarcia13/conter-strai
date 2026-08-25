/** First-person player tuning — meters, seconds, radians. */
export const PLAYER_EYE_HEIGHT = 1.7;
/** Rest head-bone world Y for the default skin; shoulder booms pivot on the live anchor. */
export const DEFAULT_BODY_ANCHOR_Y = 1.57;
export const PLAYER_RADIUS = 0.4;
export const WALK_SPEED = 5;
export const RUN_SPEED = 9;
export const MOUSE_SENSITIVITY = 0.002;
export const PITCH_LIMIT = Math.PI / 2 - 0.01;

/** Camera-local offset for swat-guy arms/hands (x=right, y=down, z=forward). */
export const VIEWMODEL_OFFSET: [number, number, number] = [0.12, -1.67, -0.35];
/** swat-guy mesh faces +Z; camera looks −Z. */
export const VIEWMODEL_ROTATION_Y = Math.PI;
/** swat-guy faces +Z at yaw 0; offset aligns model forward with camera −Z. */
export const MODEL_FORWARD_YAW_OFFSET = Math.PI;

/** Caps physics spikes after tab switches / hitches. */
export const MAX_FRAME_DELTA_SECONDS = 0.1;

/** Local player slot until round start assigns spawns per player. */
export const DEFAULT_LOCAL_TEAM = 'soldier' as const;
export const DEFAULT_LOCAL_SPAWN_INDEX = 0;

/** Scene-graph name of the local soldier rig; aim raycasts skip it. */
export const LOCAL_PLAYER_ROOT_NAME = 'local-player';
