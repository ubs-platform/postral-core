"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_util_1 = require("./util/text-util");
const imports = {
    "@lotus-web/dynamic-queue": [
        "libs/common-global/dynamic-queue/src/index.ts"
    ],
    "@lotus-web/front-global/account-setting-pages": [
        "libs/front-global/account-setting-pages/src/index.ts"
    ],
    "@lotus-web/front-global/app-essential": [
        "libs/front-global/app-essential/src/index.ts"
    ],
    "@lotus-web/front-global/auth": ["libs/front-global/auth/src/index.ts"],
    "@lotus-web/front-global/auth-login-views": [
        "libs/front-global/auth-login-views/src/index.ts"
    ],
    "@lotus-web/front-global/button": [
        "libs/front-global/button/src/index.ts"
    ],
    "@lotus-web/front-global/changeable-text": [
        "libs/front-global/changeable-text/src/index.ts"
    ],
    "@lotus-web/front-global/circular-timer": [
        "libs/front-global/circular-timer/src/index.ts"
    ],
    "@lotus-web/front-global/debug-tools": [
        "libs/front-global/debug-tools/src/index.ts"
    ],
    "@lotus-web/front-global/drawable-canvas": [
        "libs/front-global/drawable-canvas/src/index.ts"
    ],
    "@lotus-web/front-global/error-status-pages": [
        "libs/front-global/error-status-pages/src/index.ts"
    ],
    "@lotus-web/front-global/feedback-dialog": [
        "libs/front-global/feedback-dialog/src/index.ts"
    ],
    "@lotus-web/front-global/feedback-front": [
        "libs/front-global/feedback-front/src/index.ts"
    ],
    "@lotus-web/front-global/images": [
        "libs/front-global/images/src/index.ts"
    ],
    "@lotus-web/front-global/loading-indicator": [
        "libs/front-global/loading-indicator/src/index.ts"
    ],
    "@lotus-web/front-global/login-pages": [
        "libs/front-global/login-pages/src/index.ts"
    ],
    "@lotus-web/front-global/markdown-editor": [
        "libs/front-global/markdown-editor/src/index.ts"
    ],
    "@lotus-web/front-global/markdown-sanitizer": [
        "libs/front-global/markdown-sanitizer/src/index.ts"
    ],
    "@lotus-web/front-global/minky/reform-ngx-mona": [
        "libs/front-global/minky/reform-ngx-mona/src/index.ts"
    ],
    "@lotus-web/front-global/mobile-gestures-util": [
        "libs/front-global/mobile-gestures-util/src/index.ts"
    ],
    "@lotus-web/front-global/ng-auth-guards": [
        "libs/front-global/ng-auth-guards/src/index.ts"
    ],
    "@lotus-web/front-global/page-grouping-utils": [
        "libs/front-global/page-grouping-utils/src/index.ts"
    ],
    "@lotus-web/front-global/password-reset": [
        "libs/front-global/password-reset/src/index.ts"
    ],
    "@lotus-web/front-global/predefined-data": [
        "libs/front-global/predefined-data/src/index.ts"
    ],
    "@lotus-web/front-global/prompt-overlays": [
        "libs/front-global/prompt-overlays/src/index.ts"
    ],
    "@lotus-web/front-global/registration": [
        "libs/front-global/registration/src/index.ts"
    ],
    "@lotus-web/front-global/sidebar": [
        "libs/front-global/sidebar/src/index.ts"
    ],
    "@lotus-web/front-global/table": ["libs/front-global/table/src/index.ts"],
    "@lotus-web/front-global/ubs-touch-ngx": [
        "libs/front-global/ubs-touch-ngx/src/index.ts"
    ],
    "@lotus-web/front-global/ui/page-container": [
        "libs/front-global/ui/page-container/src/index.ts"
    ],
    "@lotus-web/front-global/user-service-wraps": [
        "libs/front-global/user-service-wraps/src/index.ts"
    ],
    "@lotus-web/icon-type": ["libs/front-global/icon-type/src/index.ts"],
    "@lotus-web/lotus-backend-exams": [
        "libs/lotus-backend/exams/src/index.ts"
    ],
    "@lotus-web/lotus-backend/book-analyses": [
        "libs/lotus-backend/book-analyses/src/index.ts"
    ],
    "@lotus-web/lotus-common-question-book-analyse-core": [
        "libs/lotus-common/question-book-analyse-core/src/index.ts"
    ],
    "@lotus-web/lotus-common/books": ["libs/lotus-common/books/src/index.ts"],
    "@lotus-web/lotus-footer": [
        "libs/tetakent-frontend/footer/footer.component"
    ],
    "@lotus-web/lotus-footer-vertical": [
        "libs/tetakent-frontend/footer-horizontal/footer-horizontal.component"
    ],
    "@lotus-web/lotus-frontend-books": [
        "libs/lotus-frontend/books/src/index.ts"
    ],
    "@lotus-web/lotus-frontend-main-page": [
        "libs/lotus-frontend/main-page/src/index.ts"
    ],
    "@lotus-web/lotus-frontend-shared": [
        "libs/lotus-frontend/shared/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/book-analysis": [
        "libs/lotus-frontend/book-analysis/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/book-editor-interior": [
        "libs/lotus-frontend/book-editor-interior/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/book-generate-dialog": [
        "libs/lotus-frontend/book-generate-dialog/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/book-interior-bar": [
        "libs/lotus-frontend/book-interior-bar/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/book-promotion-page": [
        "libs/lotus-frontend/book-promotion-page/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/book-trial-session": [
        "libs/lotus-frontend/book-trial-session/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/book-viewer-interior": [
        "libs/lotus-frontend/book-viewer-interior/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/books-current-user-view": [
        "libs/lotus-frontend/books-current-user-view/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/publisher-request": [
        "libs/lotus-frontend/publisher-request/src/index.ts"
    ],
    "@lotus-web/lotus-frontend/question-viewer": [
        "libs/lotus-frontend/question-viewer/src/index.ts"
    ],
    "@lotus-web/predefined-data": [
        "libs/front-global/predefined-data/src/index.ts"
    ],
    "@lotus-web/pwa-suggestion": [
        "libs/front-global/pwa-suggestion/pwa-suggestion.component.ts"
    ],
    "@ubs-platform/front-base": ["libs/front-global/front-bases/index.ts"],
    "@ubs-platform/minky": ["libs/front-global/minky/core/src/index.ts"],
    "@ubs-platform/minky-reform-ngx": [
        "libs/front-global/minky/reform-ngx/src/index.ts"
    ],
    "@ubs-platform/minky-reform-ngx-prime": [
        "libs/front-global/minky/reform-ngx-prime/src/index.ts"
    ],
    "add-library-login": [
        "libs/lotus-frontend/add-library-login/src/index.ts"
    ],
    "array-to-object": ["libs/front-global/array-to-object/src/index.ts"],
    "book-comments": ["libs/lotus-frontend/book-comments/src/index.ts"],
    "book-interior": [
        "libs/lotus-frontend/book-interior-v2/book-interior/src/index.ts"
    ],
    "book-interior-bar-v2": [
        "libs/lotus-frontend/book-interior-v2/book-interior-bar-v2/src/index.ts"
    ],
    "book-interior-common": [
        "libs/lotus-frontend/book-interior-v2/book-interior-common/src/index.ts"
    ],
    "book-search": ["libs/lotus-frontend/book-search/src/index.ts"],
    "books-offline": ["libs/lotus-frontend/books-offline/src/index.ts"],
    "books-offline-core": [
        "libs/lotus-frontend/books-offline-core/src/index.ts"
    ],
    "chatbox-main-page": [
        "libs/tkai-frontend/chatbox-main-page/src/index.ts"
    ],
    "common": ["libs/admin-front/common/src/index.ts"],
    "corp-identity": ["libs/tetakent-frontend/corp-identity/src/index.ts"],
    "date-utils": ["libs/common-global/date-utils/src/index.ts"],
    "fake-duolingo-bar": [
        "libs/lotus-frontend/fake-duolingo-bar/src/index.ts"
    ],
    "feedback-admin": ["libs/admin-front/feedback-admin/src/index.ts"],
    "front-global/feedback-form-utils": [
        "libs/front-global/feedback-form-utils/src/index.ts"
    ],
    "global-pipes": ["libs/front-global/global-pipes/src/index.ts"],
    "icon": ["libs/front-global/icon/src/index.ts"],
    "interior-question": [
        "libs/lotus-frontend/book-interior-v2/interior-question/src/index.ts"
    ],
    "language-management": [
        "libs/front-global/language-management/src/index.ts"
    ],
    "lecture-core": [
        "libs/lotus-frontend/lectures/lecture-core/src/index.ts"
    ],
    "lecture-page": [
        "libs/lotus-frontend/lectures/lecture-page/src/index.ts"
    ],
    "lotus-adm-child": ["libs/admin-front/lotus-adm-child/src/index.ts"],
    "lotus-adm-parent": ["libs/admin-front/lotus-adm-parent/src/index.ts"],
    "lotus-app": ["libs/front-global/lotus-app/src/index.ts"],
    "lotus-beta-welcome-dial": [
        "libs/lotus-frontend/lotus-beta-welcome-dial/src/index.ts"
    ],
    "main-page-books": ["libs/lotus-frontend/main-page-books/src/index.ts"],
    "main-page-introduction": [
        "libs/lotus-frontend/main-page-introduction/src/index.ts"
    ],
    "mona-mobile-experience-ng": [
        "libs/front-global/mona-mobile-experience-ng/src/index.ts"
    ],
    "ngx-index-auto-load": [
        "libs/front-global/ngx-index-auto-load/src/index.ts"
    ],
    "object-to-query-parameters": [
        "libs/front-global/object-to-query-parameters/src/index.ts"
    ],
    "offline-image-util": [
        "libs/front-global/offline-image-util/src/index.ts"
    ],
    "postral-core/account-seller-inhouse": [
        "libs/postral-core-frontend/account-seller-inhouse/src/index.ts"
    ],
    "postral-core/account-seller-settings": [
        "libs/postral-core-frontend/account-seller-settings/src/index.ts"
    ],
    "postral-core/account-user-edit": [
        "libs/postral-core-frontend/account-user-edit/src/index.ts"
    ],
    "postral-core/account-user-select": [
        "libs/postral-core-frontend/account-user-select/src/index.ts"
    ],
    "postral-core/admin": ["libs/postral-core-frontend/admin/src/index.ts"],
    "postral-core/client": ["libs/postral-core-frontend/client/src/index.ts"],
    "postral-core/forms": ["libs/postral-core-frontend/forms/src/index.ts"],
    "pwa-update-version": [
        "libs/front-global/pwa-update-version/src/index.ts"
    ],
    "report-utils": ["libs/front-global/report-utils/src/index.ts"],
    "santral-notify": ["libs/admin-front/notify/src/index.ts"],
    "santral-user": ["libs/admin-front/user/src/index.ts"],
    "social-application-restriction": [
        "libs/front-global/social-application-restriction/src/index.ts"
    ],
    "social-comments": ["libs/front-global/social-comments/src/index.ts"],
    "superlama-client": ["libs/front-global/superlama-client/src/index.ts"],
    "theme-management": ["libs/front-global/theme-management/src/index.ts"],
    "ui-element-utils": ["libs/front-global/ui-element-utils/src/index.ts"],
    "undo-redo-helper": ["libs/front-global/undo-redo-helper/src/index.ts"],
    "webdialog": ["libs/front-global/webdialog/src/index.ts"]
};
function pupulate(fuck) {
    return Object.keys(imports).map(a => {
        const librarySourcePath = imports[a][0];
        const libName = /libs\/(.*)\/src\/index.ts/.exec(librarySourcePath)?.[1];
        return {
            finding: fuck(a),
            replaceWith: (f) => {
                if (!f.includes("/node_modules/") && !f.includes(".angular/") && !f.includes(".nx/") && f.endsWith(".ts")) {
                    return fuck(["@lotus", libName].join("/"));
                }
            }
        };
    });
}
text_util_1.TextUtil.replaceText("/home/huseyin/Belgeler/Dev/Tetakent/lotus-web", [
    ...pupulate((a) => "from \"" + a + "\""),
    ...pupulate((a) => "from '" + a + "'"),
    ...pupulate((a) => "require('" + a + "')"),
    ...pupulate((a) => "import('" + a + "')"),
    ...pupulate((a) => "require(\"" + a + "\")"),
    ...pupulate((a) => "import(\"" + a + "\")"),
]);
//# sourceMappingURL=lotus-util.js.map