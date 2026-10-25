# Sanctuary: Endless Calm, pixel asset pack

All art is original, drawn in code on one 16-colour palette. Free to use in your hackathon project.
Game resolution: 320x180 with `pixelArt: true`. Every sprite is at native size, scale it in the engine.

## Folders
- sprites/creatures: drifter, weight (Room 1), alarm_clock, mail_stack, sticky_note (Room 2), watcher_eye, whisper (Room 3)
- sprites/bosses: boss_gloom (32x32), boss_deadline (32x32), boss_crowd_mask (16x16, spawn 6 and rotate), boss_crowd_ring (64x64 art), *_silhouette (Library "???" state)
- sprites/bubbles: bubble (16), bubble_myth (pink), bubble_fact (blue), bubble_big (32). Draw the text on top in code
- sprites/items: clarity_orb, companion_orb, ink_dot, music_note
- sprites/hazards: puddle, coffee_spill
- sprites/player: greyscale layers for the creator (skin, hair_0/1, outfit_0/1, acc_glasses, acc_scarf). Tint each with sprite.setTint(color). Use the matching player_outline_h{hair}_o{outfit} layer underneath. player_preview_default shows a finished example
- tiles: floor_rain, floor_desk, floor_theatre (16x16, tileSprite)
- props: window, bed, curtain, desk_edge, mail_pillar, coffee_cup, seat_row, lamp, mirror
- icons (16x16 badges): tool_pulse, tool_journal, tool_lantern, tool_headphones, up_pause, up_boundary, up_deep_breath, up_rest, up_sleep_well, up_friend, up_walk, up_clear_mind, hub_play, hub_library, hub_wardrobe, hub_tools, ui_lock, ui_letter, ui_star_full, ui_star_empty, ui_coin (10x10)
- ui: ui_panel (24x24, 9-slice with 8px corners), ui_button, ui_button_pressed, ui_stress_frame (64x8), ui_stress_fill (62x6 gradient, crop its width to the Stress value), ui_card_frame, ui_card_frame_locked, loading_ring (48x48, tween scale 0.8 to 1.2 for the breathing effect)
- screens (320x180): screen_title, screen_title_full (with logo), screen_loading, screen_loading_full (ring + text), screen_hub, screen_creator, screen_results, screen_library, room_rain, room_desk, room_theatre, boss_intro_gloom, boss_intro_deadline, boss_intro_crowd, logo (200x60)
- previews: contact sheets of everything

## Notes
- Screen backgrounds have no UI text on purpose. Draw menu text and buttons in code with Pixelify Sans or Press Start 2P.
- Boss silhouettes are for the locked Library state. Use tint 0x000000 or swap to the *_silhouette image.
- Rooms are full backdrops. If you prefer tiles plus props, use the tiles and props folders instead.
- assets.js lists every file with its key and size for Phaser's loader.
