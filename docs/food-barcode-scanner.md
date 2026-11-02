# Food barcode scanner

Log food → Add ingredients → Scan barcode → Start camera (optional), or type barcode digits → Find product → check brand/nutrition → choose package basis (100g or 100mL) → enter amount → Add to meal → Log food.

Camera decoding stays local. Native BarcodeDetector is used where available; bundled @zxing/browser 0.1.5 supplies a fallback. The number alone is sent to the free Open Food Facts product endpoint over HTTPS, with app identification, no credentials, and no referrer. No image, diary, account or portion data is sent. Product data is not pooled into the USDA database or a shared cache. Only explicitly saved meal totals use the existing device records/backup behavior. Product attribution, ODbL link and label-check reminder appear in the scanner; privacy page updated. Internet and user-granted camera permission are needed for camera lookups. Typed codes work without camera permission.

UPC-A/EAN/GTIN length and checksum checks precede lookup. A timeout, rate-limit/service error, missing product, missing calories/macros or inconsistent nutrient values yields a clear fallback to food search/manual entry. Missing values never become zero. Genuine zero values remain valid. Energy kJ converts to kcal if necessary. All returned values are per 100 units. The package-basis selector labels grams or mL; it never converts weight to volume. Review the package, especially prepared/dry products.

Camera streams stop on close, selection, navigation, backgrounding or page exit. Session checks and aborts discard stale results. No meal is logged by scanning or selecting a result.

Validation: tests/barcode.cjs covers checksums, complete/incomplete nutrition, true zeros, kJ conversion and liquid basis. tests/barcode-mobile.cjs covers typed lookups, not-found/incomplete/network errors, denied camera permission, mocked camera detection/cleanup, explicit amounts and logging at 320/390/430px, plus actual ZXing decoding of an EAN-13 SVG fixture. Real phone camera focus/lighting still needs an on-device test.

Sources: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/ and https://github.com/zxing-js/browser. Bundled scanner licenses are in fitness-app/vendor/zxing-*-LICENSE.txt.
