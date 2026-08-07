# 5 Rustic product refresh

- Replaced the dark/neon campaign styling with one light, English-only notebook system: warm paper, ink, brick, sage, ochre, ruled lines, serif display type, and slightly irregular icon containers.
- Rebuilt the public landing page for mobile first, with a plain explanation of bill capture, sales, stock, and reports. The same composition was visually checked at 390 px and 1440 px.
- Rebuilt Home around the important actions: bill camera, Buy, Sell, four monthly numbers, and a complete grid linking to every workspace screen.
- Buy and Sell now use dedicated basket icons. Both open a themed capture sheet with camera and gallery/file choices; extracted details remain editable before saving.
- Stock now has a dedicated product-first screen. Add/edit opens in a bottom sheet, rows are directly tappable, and deletion requires an explicit destructive confirmation.
- Reports, settings, navigation, status bars, and shared component colors now use the same notebook palette. Removed the visible language/theme picker; runtime language is English and navigation theme/status bars are light.
- Supabase client creation now distinguishes native from web SSR. Native sessions use persistent AsyncStorage instead of the server stub, and native root routing restores signed-in users to the dashboard.
- `supabase/seed.sql` now creates `restaurant@restaurant.com` / `Password@123`, an `Aagan Kitchen & Cafe` workspace, restaurant stock, suppliers, customers, purchases, sales, expenses, staff, benefits, banking, fiscal period, and accounts.
- Migration `0007` fixes the shared workspace-reference trigger by reading table-specific foreign keys through `to_jsonb(NEW)`, avoiding missing-field failures on purchase, sale, benefit, and document inserts.
- Validation: TypeScript passes, all 45 Jest tests pass, static web export passes, the Android debug app assembles successfully, the local database rebuild/seed and schema lint pass, and the changed UI files were formatted with the project ESLint config under Node 22. The repository-wide lint command still hits the pre-existing Markdown processor incompatibility.
