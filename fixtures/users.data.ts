// ──────────────────────────────────────────────
// Единый источник данных о демо-аккаунтах
// ──────────────────────────────────────────────
export const USERS = [
  { login: 'standard_user',           ok: true,  tag: 'baseline'    },
  { login: 'locked_out_user',         ok: false, tag: 'locked'      },
  { login: 'problem_user',            ok: true,  tag: 'problem'     },
  { login: 'performance_glitch_user', ok: true,  tag: 'performance' },
  { login: 'error_user',              ok: true,  tag: 'error'       },
  { login: 'visual_user',             ok: true,  tag: 'visual'      },
] as const;