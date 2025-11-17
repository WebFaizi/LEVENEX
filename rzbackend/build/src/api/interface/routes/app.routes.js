"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoute = exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage: storage });
const auth_middleware_1 = require("../../middleware/auth.middleware");
const superadmin_middleware_1 = require("../../middleware/superadmin.middleware");
const frontend_auth_middleware_1 = require("../../middleware/frontend_auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const admin_login_validation_1 = require("../../utils/validation-schems/admin_login.validation");
const auth_controller_1 = require("../controllers/auth.controller");
const admin_store_validation_1 = __importDefault(require("../../utils/validation-schems/admin_store.validation"));
const location_validation_1 = require("../../utils/validation-schems/location.validation");
const category_store_validation_1 = require("../../utils/validation-schems/category_store.validation");
const category_controller_1 = require("../controllers/category.controller");
const location_controller_1 = require("../controllers/location.controller");
const blog_validation_1 = require("../../utils/validation-schems/blog.validation");
const blog_category_controller_1 = require("../controllers/blog_category.controller");
const blog_controller_1 = require("../controllers/blog.controller");
//ipaddress files
const userActionActivity_controller_1 = require("../controllers/userActionActivity.controller");
const ipAddress_controller_1 = require("../controllers/ipAddress.controller");
const ipAddress_validation_1 = require("../../utils/validation-schems/ipAddress.validation");
//IP Blacklist
const ipBlacklist_controller_1 = require("../controllers/ipBlacklist.controller");
const ipBlacklist_validation_1 = require("../../utils/validation-schems/ipBlacklist.validation");
//quotation calidation
const quotation_validation_1 = require("../../utils/validation-schems/quotation.validation");
const quotation_controller_1 = require("../controllers/quotation.controller");
// import { getUsersProfiles, imageCaptionUpdate, imageUpload, removeImages, removeSingleImage, setProfileImage, updateUserProfile } from "../controllers/user.controller";
//Redirects URLS
const redirectsUrl_controller_1 = require("../controllers/redirectsUrl.controller");
const redirectsUrl_validation_1 = require("../../utils/validation-schems/redirectsUrl.validation");
//static page
const staticPage_controller_1 = require("../controllers/staticPage.controller");
const staticPage_validation_1 = require("../../utils/validation-schems/staticPage.validation");
//settings
const setting_controller_1 = require("../controllers/setting.controller");
const theme_validation_1 = require("../../utils/validation-schems/theme.validation");
const setting_validation_1 = require("../../utils/validation-schems/setting.validation");
//seo
const seo_validation_1 = require("../../utils/validation-schems/seo.validation");
const seo_controller_1 = require("../controllers/seo.controller");
//banner
const advertisig_validation_1 = require("../../utils/validation-schems/advertisig.validation");
const advertising_controller_1 = require("../controllers/advertising.controller");
//listing
const listing_validation_1 = require("../../utils/validation-schems/listing.validation");
const listing_controller_1 = require("../controllers/listing.controller");
//featured Listing
const featuredListing_validation_1 = require("../../utils/validation-schems/featuredListing.validation");
const featuredListing_controller_1 = require("../controllers/featuredListing.controller");
//chatboat Listing
// import {  } from "../../utils/validation-schems/chatboatListing.validation";
const chatboatListing_controller_1 = require("../controllers/chatboatListing.controller");
//featured Listing
const premiumListing_validation_1 = require("../../utils/validation-schems/premiumListing.validation");
const premiumListing_controller_1 = require("../controllers/premiumListing.controller");
//chatboar Listing and user
// import {  } from "../../utils/validation-schems/chatboat.validation";
const chatboat_controller_1 = require("../controllers/chatboat.controller");
//Product Listing
const productListing_validation_1 = require("../../utils/validation-schems/productListing.validation");
const productListing_controller_1 = require("../controllers/productListing.controller");
//Keyword Listing
// import {  } from "../../utils/validation-schems/keywords.validation";
const keywords_controller_1 = require("../controllers/keywords.controller");
//Newsletter
const newsletter_validation_1 = require("../../utils/validation-schems/newsletter.validation");
const newsletter_controller_1 = require("../controllers/newsletter.controller");
//Marketing Banner
const marketingBanner_validation_1 = require("../../utils/validation-schems/marketingBanner.validation");
const marketingBanner_controller_1 = require("../controllers/marketingBanner.controller");
const sitemap_controller_1 = require("../controllers/sitemap.controller");
const listingSitemap_controller_1 = require("../controllers/listingSitemap.controller");
const featuredListingSitemap_controller_1 = require("../controllers/featuredListingSitemap.controller");
const productSitemap_controller_1 = require("../controllers/productSitemap.controller");
const productDetailsSitemap_controller_1 = require("../controllers/productDetailsSitemap.controller");
const blogSitemap_controller_1 = require("../controllers/blogSitemap.controller");
const searchKeyword_controller_1 = require("../controllers/searchKeyword.controller");
const customSitemap_controller_1 = require("../controllers/customSitemap.controller");
const jobCategorySitemap_controller_1 = require("../controllers/jobCategorySitemap.controller");
const jobsSitemap_controller_1 = require("../controllers/jobsSitemap.controller");
const getGeneratedSitemapsUrl_controller_1 = require("../controllers/getGeneratedSitemapsUrl.controller");
//frontend controller and validation
const admin_login_validation_2 = require("../../utils/validation-schems/admin_login.validation");
const auth_controller_2 = require("../controllers/auth.controller");
const frontend_validation_1 = require("../../utils/validation-schems/frontend.validation");
const homepage_controller_1 = require("../controllers/homepage.controller");
const frontend_validation_2 = require("../../utils/validation-schems/frontend.validation");
const frontend_controller_1 = require("../controllers/frontend.controller");
//Job Module
const jobModule_validation_1 = require("../../utils/validation-schems/jobModule.validation");
const jobModule_controller_1 = require("../controllers/jobModule.controller");
//job module frontend
const jobModule_controller_2 = require("../controllers/jobModule.controller");
//user Product Listing
// import { productStoreValidation,deleteProductListingValidation } from "../../utils/validation-schems/productListing.validation";
const productListing_controller_2 = require("../controllers/productListing.controller");
const faq_controller_1 = require("../controllers/faq.controller");
const faq_validation_1 = require("../../utils/validation-schems/faq.validation");
const route = express_1.default.Router();
const appRoute = (router) => {
    try {
        router.use('/v1', route);
        route.post('/get-server-side-metadetails', (0, validation_middleware_1.validateRequest)(seo_validation_1.serverSideMetaDetailsValidation), seo_controller_1.serverSideMetaDetails);
        //frontend routs
        route.post('/forgot-password', (0, validation_middleware_1.validateRequest)(admin_login_validation_1.checkSuperadminUserValidation), auth_controller_1.forgotPassword);
        route.post('/reset-password', (0, validation_middleware_1.validateRequest)(admin_login_validation_1.resetPasswordValidation), auth_controller_1.resetPassword);
        route.post('/store-premium-request', (0, validation_middleware_1.validateRequest)(frontend_validation_2.storePremiumRequestValidation), frontend_controller_1.storePremiumRequest);
        route.post('/unsubscribe-site', (0, validation_middleware_1.validateRequest)(frontend_validation_1.unsubdcribeSiteValidation), frontend_controller_1.unsubscribeSite);
        route.get("/get-user-by-token/:token", auth_middleware_1.protectedRoute, auth_controller_1.getuserByToken);
        route.get("/get-frontenduser-by-token/:token", auth_controller_1.getuserByToken);
        //common url 
        route.get('/get-listing-details-data', (0, validation_middleware_1.validateRequest)(frontend_validation_2.getListingDetailsValidation), frontend_controller_1.getListingDetails);
        route.get('/get-all-listing-slug', frontend_controller_1.getAllListingWithSlug);
        route.get('/get-all-blogs-slug', frontend_controller_1.getAllBlogsSlug);
        route.get('/get-listing-preview-data', (0, validation_middleware_1.validateRequest)(frontend_validation_2.getListingDetailsValidation), frontend_controller_1.getListingStaticData);
        //add search count
        route.post('/store-category-search-count', (0, validation_middleware_1.validateRequest)(frontend_validation_1.storeCategorySearchCountValidation), frontend_controller_1.storeCategorySearchCount);
        route.get('/category-search-count-list', frontend_controller_1.categorySearchCountList);
        //get listing category wise
        route.get('/get-listing-category-wise', frontend_controller_1.getListingCategoryWise);
        //get category wise product list 
        route.get('/get-category-wise-product-list', frontend_controller_1.getCategoryWiseProductList);
        //get listing wise product list
        route.get('/get-listing-wise-product-list', frontend_controller_1.getListingWiseProductList);
        //get data of listing wise review
        route.get('/get-review-listing-wise', frontend_controller_1.getListingWiseReviewList);
        //get data of blog wise review
        route.get('/get-review-blog-wise', frontend_controller_1.getBlogWiseReviewList);
        //sitemap frotend
        route.get('/sitemap-urls', frontend_controller_1.sitemapFronendUrls);
        //job module
        route.get('/get-job-category', jobModule_controller_2.getFrontendJobCategoryList);
        route.get('/get-category-wise-job', jobModule_controller_2.getFrontendJobList);
        route.get('/get-job-details', jobModule_controller_2.getFrontendJobDetails);
        route.post('/apply-for-job', (0, validation_middleware_1.validateRequest)(frontend_validation_2.jobApplyValidation), jobModule_controller_2.applyForJob);
        route.post('/frontend-login', (0, validation_middleware_1.validateRequest)(admin_login_validation_2.forntendLoginValidation), auth_controller_2.frontendLogin);
        route.post('/frontend-registration', (0, validation_middleware_1.validateRequest)(admin_login_validation_2.forntendRegistrationValidation), auth_controller_2.frontendRegistration);
        //search city or area
        route.get('/search-city-area', (0, validation_middleware_1.validateRequest)(location_validation_1.searchCityAreaValidation), location_controller_1.searchCityOrArea);
        //setting 
        route.get('/frontend-settings', setting_controller_1.getFrontendSetting);
        route.get('/frontend-footer', setting_controller_1.getFrontendFooter);
        route.get('/frontend-ads', setting_controller_1.getFrontendAds);
        route.get('/check-redirect-url', setting_controller_1.checkRedirectCurrentUrl);
        route.get('/get-static-page', frontend_controller_1.getStaticPage);
        route.post('/submit-contact-us-form', (0, validation_middleware_1.validateRequest)(location_validation_1.submitContactUsFormValidation), frontend_controller_1.submitContactUsForm);
        route.get('/search-category', frontend_controller_1.getSeachCategory);
        //user listing
        route.post('/user-store-listing-data', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.listingStoreValidation), listing_controller_1.storeListingData);
        route.post('/user-update-listing-data', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.listingStoreValidation), listing_controller_1.updateListingData);
        route.get("/get-user-listing-list", auth_middleware_1.protectedRoute, listing_controller_1.getUserListingList);
        route.get("/get-user-listing-details/:listing_id", auth_middleware_1.protectedRoute, listing_controller_1.listingDetails);
        route.post("/delete-user-listings", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.deleteListingValidation), listing_controller_1.deleteListings);
        //user product list
        route.get('/user-listing-product-list', auth_middleware_1.protectedRoute, productListing_controller_2.userProductList);
        route.get('/user-all-listing-list', auth_middleware_1.protectedRoute, listing_controller_1.userAllListingList);
        route.post('/store-product-by-user', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(productListing_validation_1.productStoreValidation), productListing_controller_2.storeProductByUser);
        route.get('/user-product-details/:product_id', auth_middleware_1.protectedRoute, productListing_controller_1.listingProductDetails);
        route.post('/remove-Product-image/', (0, validation_middleware_1.validateRequest)(productListing_validation_1.removeProductImageValidation), auth_middleware_1.protectedRoute, productListing_controller_1.removeProductImage);
        route.post('/update-user-product', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(productListing_validation_1.productStoreValidation), productListing_controller_1.updateProductListing);
        route.post("/delete-user-product", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(productListing_validation_1.deleteProductListingValidation), productListing_controller_1.deleteProductListing);
        //home page
        route.post('/home-page', (0, validation_middleware_1.validateRequest)(frontend_validation_1.homePageValidation), homepage_controller_1.homePage);
        //chat moule
        route.post('/get-chatboat-listing', (0, validation_middleware_1.validateRequest)(frontend_validation_1.getChatboatListingValidation), homepage_controller_1.getChatboatListing);
        route.post('/add-quotation-frontend', (0, validation_middleware_1.validateRequest)(quotation_validation_1.addFrontendQoutationValidation), quotation_controller_1.addQoutation);
        //user profile
        route.get('/get-user-profile-details', auth_middleware_1.protectedRoute, auth_controller_1.frontendUserDetails);
        route.get('/get-live-user-list', auth_middleware_1.protectedRoute, auth_controller_1.getLiveUserList);
        route.post('/update-user-profile-details', (0, validation_middleware_1.validateRequest)(admin_login_validation_1.updateUserProfileDetailsValidation), auth_middleware_1.protectedRoute, auth_controller_1.updateUserProfileDetails);
        route.post('/update-user-password', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(admin_login_validation_1.userUpdatePasswordValidation), auth_controller_1.userUpdatePassword);
        //blogmodule
        route.get('/frontend-blog-list', blog_controller_1.getBlogListFrontend);
        route.post('/store-blog-by-user', frontend_auth_middleware_1.protectedFrontendRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.storeBlogDetailsSchema), blog_controller_1.storeBlogByUser);
        route.get('/frontend-blog-details/:blog_id', blog_controller_1.getBlogDetailFrontend);
        route.post('/add-user-blog-review', frontend_auth_middleware_1.protectedFrontendRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.addUserBlogReviewValidation), blog_controller_1.addUserBlogReview);
        route.post('/add-user-listing-review', frontend_auth_middleware_1.protectedFrontendRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.addUserListingReviewValidation), blog_controller_1.addUserListingReview);
        route.get('/get-slug-wise-data', frontend_auth_middleware_1.protectedFrontendRoute, frontend_controller_1.getSlugWiseResponse);
        route.get('/sitemap-data', frontend_controller_1.sitemapData);
        //end Frontedn API                        
        //start Admin Api
        route.get('/get-premium-request', auth_middleware_1.protectedRoute, setting_controller_1.getPremiumRequest);
        route.get('/logout-all-admin-user', auth_middleware_1.protectedRoute, auth_controller_1.logoutAllAdminUser);
        //login with otp
        route.post('/send-admin-login-otp', (0, validation_middleware_1.validateRequest)(admin_login_validation_1.sendOtpValidation), auth_controller_1.loginOtpGenerate);
        route.post('/verify-login-otp', (0, validation_middleware_1.validateRequest)(admin_login_validation_1.verifyOtpValidation), auth_controller_1.loginOtpVerify);
        //sitemap.xml
        route.get('/dashboard-details', auth_middleware_1.protectedRoute, setting_controller_1.getDashboardDetails);
        route.get('/get-blog-reviewList', auth_middleware_1.protectedRoute, blog_controller_1.getBlogReviewList);
        route.get('/get-listing-reviewList', auth_middleware_1.protectedRoute, listing_controller_1.getListingReviewList);
        route.post('/delete-listing-reviewlist', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.reviewDeleteSchema), listing_controller_1.deleteReviewList);
        route.post('/delete-blog-reviewlist', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.reviewDeleteSchema), blog_controller_1.deleteBlogReviewList);
        route.post('/approve-reviews', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.reviewapproveSchema), blog_controller_1.approveReviewList);
        route.get("/get-review-import-excel-formet", auth_middleware_1.protectedRoute, blog_controller_1.getReviewImportExcel);
        route.get("/get-all-user", auth_middleware_1.protectedRoute, auth_controller_1.getAllUsersList);
        route.get("/get-all-blog", auth_middleware_1.protectedRoute, blog_controller_1.getAllBlogList);
        route.get("/get-all-listing", auth_middleware_1.protectedRoute, listing_controller_1.getAllListingList);
        route.post('/add-blog-review', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.addAdminBlogReviewValidation), blog_controller_1.addAdminBlogReview);
        route.post('/add-listing-review', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.addAdminListingReviewValidation), listing_controller_1.addAdminListingReview);
        //all listing and all user 
        route.get('/get-all-listing', auth_middleware_1.protectedRoute, setting_controller_1.getAllListingData);
        route.get('/get-all-user', auth_middleware_1.protectedRoute, setting_controller_1.getAllUserData);
        route.post("/import-blog-reviews", auth_middleware_1.protectedRoute, exports.upload.single("file"), blog_controller_1.importBlogReview);
        route.post("/import-listing-reviews", auth_middleware_1.protectedRoute, exports.upload.single("file"), listing_controller_1.importListingReview);
        route.get('/generate-category-sitemap', auth_middleware_1.protectedRoute, sitemap_controller_1.generateSitemaps);
        route.get('/generate-listing-sitemap', auth_middleware_1.protectedRoute, listingSitemap_controller_1.generateListingSitemaps);
        route.get('/generate-featured-listing-sitemap', auth_middleware_1.protectedRoute, featuredListingSitemap_controller_1.generateFeaturedSitemaps);
        route.get('/generate-product-sitemap', auth_middleware_1.protectedRoute, productSitemap_controller_1.generateProductSitemaps);
        route.get('/generate-product-details-sitemap', auth_middleware_1.protectedRoute, productDetailsSitemap_controller_1.generateProductDetailsSitemaps);
        route.get('/generate-blog-details-sitemap', auth_middleware_1.protectedRoute, blogSitemap_controller_1.generateBlogDetailsSitemaps);
        route.get('/generate-search-keyword-sitemap', auth_middleware_1.protectedRoute, searchKeyword_controller_1.generateSearchKeywordSitemaps);
        route.get('/generate-job-category-sitemap', auth_middleware_1.protectedRoute, jobCategorySitemap_controller_1.generateJobCategorySitemaps);
        route.get('/generate-jobs-sitemap', auth_middleware_1.protectedRoute, jobsSitemap_controller_1.generateJobSitemaps);
        route.post('/generate-custom-sitemap', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(marketingBanner_validation_1.customUrlValidation), customSitemap_controller_1.generateCustomSitemaps);
        route.get('/generated-sitemap-urls', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(marketingBanner_validation_1.getGeneratedUrlValidation), getGeneratedSitemapsUrl_controller_1.getGenerateSitemaps);
        route.get('/get-custom-sitemap-urls', auth_middleware_1.protectedRoute, customSitemap_controller_1.updateCustomSitemaps);
        //Newsletter
        route.post('/update-newsletter', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(newsletter_validation_1.updateNewsletterValidation), newsletter_controller_1.updateNewsletter);
        route.get('/newsletter-details', auth_middleware_1.protectedRoute, newsletter_controller_1.newsletterDetails);
        //Newsletter
        route.post('/update-marketing-banner', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(marketingBanner_validation_1.updateMarketingBannerValidation), marketingBanner_controller_1.updateMarketingBanner);
        route.get('/marketing-banner-details', auth_middleware_1.protectedRoute, marketingBanner_controller_1.marketingBannerDetails);
        route.get('/get-subscribers-excel-formet', auth_middleware_1.protectedRoute, quotation_controller_1.getSubscribersExcelFormet);
        route.get('/export-subscribers', auth_middleware_1.protectedRoute, quotation_controller_1.ExportSubscribers);
        route.post('/import-subscribers', auth_middleware_1.protectedRoute, exports.upload.single("file"), quotation_controller_1.ImportSubscribers);
        route.get('/get-subscribers-list', auth_middleware_1.protectedRoute, quotation_controller_1.getSubscriberList);
        route.post("/delete-subscribers", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(quotation_validation_1.deleteSubscribersValidation), quotation_controller_1.deleteSubscribers);
        route.get("/send-mail-subscribers", auth_middleware_1.protectedRoute, quotation_controller_1.sendMailSubscribers);
        //Keywords List
        route.get('/delete-all-keyword', superadmin_middleware_1.superadminRoute, keywords_controller_1.deleteAllKeywords);
        route.get("/get-keywords", auth_middleware_1.protectedRoute, keywords_controller_1.getKeywords);
        route.post("/import-keywords", auth_middleware_1.protectedRoute, exports.upload.single("file"), keywords_controller_1.importKeyword);
        route.get("/export-keywords", auth_middleware_1.protectedRoute, keywords_controller_1.exportKeywordExcel);
        route.post("/delete-keywords", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(marketingBanner_validation_1.deleteKeywordValidation), keywords_controller_1.deleteKeywords);
        route.post("/update-keyword", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(marketingBanner_validation_1.updateKeywordValidation), keywords_controller_1.updateKeywords);
        //Listing Product Module
        route.get('/delete-all-product', superadmin_middleware_1.superadminRoute, productListing_controller_1.deleteAllProduct);
        route.post('/store-listing-product', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(productListing_validation_1.productStoreValidation), productListing_controller_1.storeProductListing);
        route.post('/update-listing-product', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(productListing_validation_1.productStoreValidation), productListing_controller_1.updateProductListing);
        route.get('/listing-product-list', auth_middleware_1.protectedRoute, productListing_controller_1.listingProductList);
        route.get('/listing-product-details/:product_id', auth_middleware_1.protectedRoute, productListing_controller_1.listingProductDetails);
        route.post("/delete-product-listing", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(productListing_validation_1.deleteProductListingValidation), productListing_controller_1.deleteProductListing);
        route.get("/export-product", auth_middleware_1.protectedRoute, productListing_controller_1.exportProduct);
        route.post("/import-product", auth_middleware_1.protectedRoute, exports.upload.single("file"), productListing_controller_1.importProduct);
        //PremiumLIsting Module.
        route.post('/store-premium-listing', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(premiumListing_validation_1.premiumListingStoreValidation), premiumListing_controller_1.storePremiumListingData);
        route.get("/get-premium-listing-list", auth_middleware_1.protectedRoute, premiumListing_controller_1.getPremiumListingList);
        route.post("/delete-premium-listing", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(premiumListing_validation_1.deletePremiumListingStoreValidation), premiumListing_controller_1.deletePremiumListingList);
        route.get("/get-premium-listing-details/:listing_id", auth_middleware_1.protectedRoute, premiumListing_controller_1.getPremiumListingDetails);
        route.post('/update-premium-listing', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(premiumListing_validation_1.premiumListingStoreValidation), premiumListing_controller_1.updatePremiumListingData);
        //Listing Module
        route.get('/delete-all-listing', superadmin_middleware_1.superadminRoute, listing_controller_1.deleteAllListings);
        route.post('/store-listing-data', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.listingStoreValidation), listing_controller_1.storeListingData);
        route.post('/update-listing-data', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.listingStoreValidation), listing_controller_1.updateListingData);
        route.get("/get-listing-list", auth_middleware_1.protectedRoute, listing_controller_1.getListingList);
        route.get("/get-listing-details/:listing_id", auth_middleware_1.protectedRoute, listing_controller_1.listingDetails);
        route.post("/delete-listings", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.deleteListingValidation), listing_controller_1.deleteListings);
        route.post("/update-listing-status", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(listing_validation_1.listingStatusValidation), listing_controller_1.listingsStatusUpdate);
        //listing Export
        route.get("/get-import-excel-formet", auth_middleware_1.protectedRoute, listing_controller_1.listingExportFormetDownload);
        route.post("/import-listing", auth_middleware_1.protectedRoute, exports.upload.single("file"), listing_controller_1.importListing);
        route.post("/import-fresh-listing", auth_middleware_1.protectedRoute, exports.upload.single("file"), listing_controller_1.importFreshListing);
        route.post("/import-user-listing", auth_middleware_1.protectedRoute, exports.upload.single("file"), listing_controller_1.importUserListing);
        route.get("/export-listing", auth_middleware_1.protectedRoute, listing_controller_1.exportListing);
        route.get('/listing-banners', auth_middleware_1.protectedRoute, listing_controller_1.listingBanners);
        route.post('/update-listing-banners', (0, validation_middleware_1.validateRequest)(listing_validation_1.listingBannerValidation), auth_middleware_1.protectedRoute, listing_controller_1.updateListingBanners);
        route.get('/category-wise-export/:category_id', auth_middleware_1.protectedRoute, listing_controller_1.categoryWiseExport);
        route.post('/category-wise-import', auth_middleware_1.protectedRoute, exports.upload.single("file"), listing_controller_1.importCategoryWiseListing);
        route.post('/delete-duplicate-listing', auth_middleware_1.protectedRoute, listing_controller_1.deleteDuplicateListing);
        //featured listing
        route.get('/delete-all-featured-listing', superadmin_middleware_1.superadminRoute, featuredListing_controller_1.deleteAllFeaturedListings);
        route.post('/add-featured-listing', (0, validation_middleware_1.validateRequest)(featuredListing_validation_1.featuredlistingStoreValidation), auth_middleware_1.protectedRoute, featuredListing_controller_1.storeFeaturedListing);
        route.get('/get-featured-listing', auth_middleware_1.protectedRoute, featuredListing_controller_1.getFeaturedListingList);
        route.get('/get-featured-details/:featured_listing_id', auth_middleware_1.protectedRoute, featuredListing_controller_1.getFeaturedListingDetails);
        route.get("/featured-listing-export", auth_middleware_1.protectedRoute, featuredListing_controller_1.exportFeaturedListing);
        route.post("/featured-listing-import", auth_middleware_1.protectedRoute, exports.upload.single("file"), featuredListing_controller_1.importFeaturedListing);
        route.post("/premium-listing-import", auth_middleware_1.protectedRoute, exports.upload.single("file"), premiumListing_controller_1.importPremiumListing);
        route.post("/delete-featured-listing", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(featuredListing_validation_1.deleteFeaturedlistingValidation), featuredListing_controller_1.deleteFeaturedlisting);
        //chatboat listing
        route.get('/get-chat-boat-listing', auth_middleware_1.protectedRoute, chatboatListing_controller_1.getChatboatListingList);
        route.get('/delete-all-chatboat-listing', superadmin_middleware_1.superadminRoute, chatboatListing_controller_1.deleteAllChatboatListings);
        route.get('/get-listing-city-wise', auth_middleware_1.protectedRoute, chatboatListing_controller_1.getListingCityWise);
        route.post('/add-chatboat-listing', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(featuredListing_validation_1.addchatboatlistingValidation), chatboatListing_controller_1.storeChatboatListing);
        route.get('/get-chat-boat-listing-details/:chat_boat_listing_id', auth_middleware_1.protectedRoute, chatboatListing_controller_1.getChatboatListingDetails);
        route.post("/delete-chatoat-listing", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(featuredListing_validation_1.deleteChatboatlistingValidation), chatboatListing_controller_1.deleteChatboatlisting);
        route.get('/get-chat-boat-user-listing', auth_middleware_1.protectedRoute, chatboatListing_controller_1.chatBoatUserList);
        route.get('/get-chat-boat-user-export-listing', auth_middleware_1.protectedRoute, chatboatListing_controller_1.ChatBoatUserExport);
        route.get('/chatboat-listing', auth_middleware_1.protectedRoute, chatboat_controller_1.chatboatListing);
        route.post('/chatboat-user-store', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(premiumListing_validation_1.storeChatBoatUserValidation), chatboatListing_controller_1.storeChatBoatUser);
        route.post('/clear-chatboat-user', auth_middleware_1.protectedRoute, chatboatListing_controller_1.clearChatBoat);
        //admin user activity list
        route.get("/user-activity-list", auth_middleware_1.protectedRoute, auth_controller_1.userActivityList);
        //banner type 
        route.get('/delete-all-bannertype', superadmin_middleware_1.superadminRoute, advertising_controller_1.deleteAllbannerType);
        route.post("/store-banner-type", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(advertisig_validation_1.storeBannerTypeValidation), advertising_controller_1.storeBannerType);
        route.get("/get-list-banner-type", auth_middleware_1.protectedRoute, advertising_controller_1.getBannerTypesList);
        route.get("/banner-type-details/:bannertype_id", auth_middleware_1.protectedRoute, advertising_controller_1.getBannerTypesDetails);
        route.post("/update-banner-type", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(advertisig_validation_1.storeBannerTypeValidation), advertising_controller_1.updateBannerType);
        route.post("/delete-banner-type", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(advertisig_validation_1.deleteBannerTypeSchema), advertising_controller_1.deleteBannerType);
        //banners
        route.get('/delete-all-banners', superadmin_middleware_1.superadminRoute, advertising_controller_1.deletetAllBanners);
        route.post("/store-banner", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(advertisig_validation_1.storeBannerValidation), advertising_controller_1.storeBanner);
        route.get("/get-list-banner", auth_middleware_1.protectedRoute, advertising_controller_1.getBannerList);
        route.get("/get-banners-details/:banners_id", auth_middleware_1.protectedRoute, advertising_controller_1.getBannerDetails);
        route.post("/update-banner", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(advertisig_validation_1.storeBannerValidation), advertising_controller_1.updateBanner);
        route.post("/delete-banner", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(advertisig_validation_1.deleteBannerSchema), advertising_controller_1.deleteBanner);
        //banners theme
        route.get("/get-banner-theme-list", auth_middleware_1.protectedRoute, advertising_controller_1.getBannerThemeList);
        route.get("/get-banner-theme-details/:banners_theme_id", auth_middleware_1.protectedRoute, advertising_controller_1.getBannerThemeDetails);
        route.post("/update-banner-theme", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(advertisig_validation_1.storeBannerThemeValidation), advertising_controller_1.updateBannerTheme);
        //cartegory seo
        route.post("/update-category-seo", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(seo_validation_1.categorySeoValidation), seo_controller_1.updateCategorySeo);
        route.get("/get-category-seo-details", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(seo_validation_1.categorySeoDetailValidation), seo_controller_1.getCategorySeoDetails);
        route.get("/export-category-seo-details", auth_middleware_1.protectedRoute, seo_controller_1.exportCategorySeoDetails);
        route.get("/category-seo-list", auth_middleware_1.protectedRoute, seo_controller_1.getCategorySeoList);
        route.post("/import-category-seo", auth_middleware_1.protectedRoute, exports.upload.single("file"), seo_controller_1.importCategorySeo);
        //subdoamin cartegory seo
        route.post("/update-subdomain-category-seo", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(seo_validation_1.subdomainCategorySeoValidation), seo_controller_1.updateSubdomainCategorySeo);
        route.get("/get-subdoamin-category-seo-details", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(seo_validation_1.subdomainCategorySeoDetailValidation), seo_controller_1.getSubdomainCategorySeoDetails);
        route.get("/export-subdoamin-category-seo-details", auth_middleware_1.protectedRoute, seo_controller_1.exportSubcategoryCategorySeoDetails);
        route.get("/subdomain-category-seo-list", auth_middleware_1.protectedRoute, seo_controller_1.getSubdomainCategorySeoList);
        route.post("/subdomain-import-category-seo", auth_middleware_1.protectedRoute, exports.upload.single("file"), seo_controller_1.importSubdomainCategorySeo);
        //homepage seo 
        route.get('/get-homepage-seo-details', auth_middleware_1.protectedRoute, seo_controller_1.getHomePageSeo);
        route.post("/update-homepage-seo", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(seo_validation_1.homePageSeoValidation), seo_controller_1.updateHomePageSeo);
        route.get("/export-homepage-seo", seo_controller_1.exportHomepageSeoData);
        route.post("/import-homepage-seo", auth_middleware_1.protectedRoute, exports.upload.single("file"), seo_controller_1.importHomepageSeoData);
        //Listing seo
        route.post("/update-listing-seo", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(seo_validation_1.listingSeoValidation), seo_controller_1.updateListingSeo);
        route.get("/get-listing-seo-details", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(seo_validation_1.listingSeoDetailValidation), seo_controller_1.getListingSeoDetails);
        route.get("/export-listing-seo-details", auth_middleware_1.protectedRoute, seo_controller_1.exportListingSeoDetails);
        route.get("/listing-seo-list", auth_middleware_1.protectedRoute, seo_controller_1.getListingSeoList);
        route.post("/import-listing-seo", auth_middleware_1.protectedRoute, exports.upload.single("file"), seo_controller_1.importListingSeo);
        //setting data
        route.post("/save-theme-page", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(theme_validation_1.themePageValidation), setting_controller_1.storeTheme);
        route.get("/get-theme", auth_middleware_1.protectedRoute, setting_controller_1.getTheme);
        route.post("/update-setting", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(setting_validation_1.settingValidation), setting_controller_1.updateSetting);
        route.get("/clear-setting", auth_middleware_1.protectedRoute, setting_controller_1.clearSetting);
        route.get("/get-seeting-details", setting_controller_1.getSetting);
        //static page
        route.get('/delete-all-static-pages', superadmin_middleware_1.superadminRoute, staticPage_controller_1.deleteAllStaticPages);
        route.post("/save-static-page", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(staticPage_validation_1.staticPageValidation), staticPage_controller_1.storeStaticPage);
        route.get("/get-static-page-list", auth_middleware_1.protectedRoute, staticPage_controller_1.getStaticPageList);
        route.get("/get-static-page-details/:id", auth_middleware_1.protectedRoute, staticPage_controller_1.getStaticPageDetails);
        route.post("/update-static-page-details", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(staticPage_validation_1.staticPageValidation), staticPage_controller_1.updateStaticPageDetails);
        route.post("/delete-static-page/", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(staticPage_validation_1.deleteStaticPageValidation), staticPage_controller_1.deleteStaticPage);
        //route for redirects url
        route.get('/delete-all-redirects', auth_middleware_1.protectedRoute, redirectsUrl_controller_1.deleteAllRedirects);
        route.post("/store-redirects-url", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(redirectsUrl_validation_1.redirectsUrlStoreSchema), redirectsUrl_controller_1.storeRedirectsUrl);
        route.get('/get-redirects-url', auth_middleware_1.protectedRoute, redirectsUrl_controller_1.getRedircetsUrlList);
        route.post('/delete-redirects-url', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(redirectsUrl_validation_1.deleteRedircetsUrlValidation), redirectsUrl_controller_1.deleteRedirectUrl);
        route.get('/get-url-excel-formet', auth_middleware_1.protectedRoute, redirectsUrl_controller_1.getUrlExcelFormet);
        route.get('/get-redircet-url-export', auth_middleware_1.protectedRoute, redirectsUrl_controller_1.getRedirectUrlExport);
        route.post('/redircet-url-import', auth_middleware_1.protectedRoute, exports.upload.single("file"), redirectsUrl_controller_1.redirectUrlImport);
        route.get('/redirect-details/:id', auth_middleware_1.protectedRoute, redirectsUrl_controller_1.redirectDetails);
        //update footer_description
        route.post("/update-footer-description", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(setting_validation_1.footerDescriptionValidation), setting_controller_1.updateFooterDescription);
        route.post("/update-desktop-description", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(setting_validation_1.desktopDescriptionValidation), setting_controller_1.updateDesktopDescription);
        route.get("/export-tasks", auth_middleware_1.protectedRoute, setting_controller_1.exportedBackgroundProcessList);
        //auth urls
        route.post("/admin-login", (0, validation_middleware_1.validateRequest)(admin_login_validation_1.adminLoginSchema), auth_controller_1.loginUser);
        route.get("/get-user-by-token/:token", auth_middleware_1.protectedRoute, auth_controller_1.getuserByToken);
        route.get("/get-frontenduser-by-token/:token", auth_controller_1.getuserByToken);
        //update password
        route.post("/update-password", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(admin_login_validation_1.updatePasswordValidation), auth_controller_1.updatePassword);
        //all pending otp
        route.get("/get-all-pending-otp", auth_middleware_1.protectedRoute, auth_controller_1.getAllPendingOtp);
        //Ip Address Module 
        route.get('/delete-all-ip', auth_middleware_1.protectedRoute, ipAddress_controller_1.deleteAllIp);
        route.post('/add-ip', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(ipAddress_validation_1.ipAddressValidation), ipAddress_controller_1.storeIpAddress);
        route.get('/ip-address-list', auth_middleware_1.protectedRoute, ipAddress_controller_1.listIpAddress);
        route.post('/delete-ip-address', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(ipAddress_validation_1.deleteIpAddressValidation), ipAddress_controller_1.deleteIpAddress);
        //IP Blacklist Module
        route.get('/ip-blacklist', auth_middleware_1.protectedRoute, ipBlacklist_controller_1.getIpBlacklist);
        route.post('/ip-blacklist', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(ipBlacklist_validation_1.addIpBlacklistValidation), ipBlacklist_controller_1.addIpBlacklist);
        route.put('/ip-blacklist', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(ipBlacklist_validation_1.updateIpBlacklistValidation), ipBlacklist_controller_1.updateIpBlacklist);
        route.delete('/ip-blacklist', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(ipBlacklist_validation_1.deleteIpBlacklistValidation), ipBlacklist_controller_1.deleteIpBlacklist);
        route.get('/check-ip-banned', (0, validation_middleware_1.validateRequest)(ipBlacklist_validation_1.checkIpBannedValidation), ipBlacklist_controller_1.checkIpBanned);
        route.get('/ip-blacklist-stats', auth_middleware_1.protectedRoute, ipBlacklist_controller_1.getIpBlacklistStats);
        // Test endpoint to see what IP backend detects
        route.get('/my-ip', (req, res) => {
            const forwarded = req.headers['x-forwarded-for'];
            const realIp = req.headers['x-real-ip'];
            const cfConnectingIp = req.headers['cf-connecting-ip'];
            let ip = '';
            if (forwarded) {
                ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
            }
            else if (realIp) {
                ip = Array.isArray(realIp) ? realIp[0] : realIp.toString();
            }
            else if (cfConnectingIp) {
                ip = Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp.toString();
            }
            else {
                ip = req.ip || req.socket.remoteAddress || req.connection.remoteAddress || '';
            }
            const cleanedIp = ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
            res.json({
                status: 1,
                message: 'Your IP address as seen by the backend',
                data: {
                    detectedIp: cleanedIp,
                    rawIp: ip,
                    headers: {
                        'x-forwarded-for': req.headers['x-forwarded-for'],
                        'x-real-ip': req.headers['x-real-ip'],
                        'cf-connecting-ip': req.headers['cf-connecting-ip']
                    },
                    reqIp: req.ip
                }
            });
        });
        //role wise login wicth checkotp and ip address 
        route.post("/check-superadmin-user", (0, validation_middleware_1.validateRequest)(admin_login_validation_1.checkSuperadminUserValidation), auth_controller_1.checkSuperadminUser);
        //quotation module
        route.get("/get-quotation-list", auth_middleware_1.protectedRoute, quotation_controller_1.getQuotationList);
        route.post("/store-quotation", (0, validation_middleware_1.validateRequest)(quotation_validation_1.quotationStoreValidation), quotation_controller_1.storeQuotation);
        route.post('/delete-quotation', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(quotation_validation_1.deleteQuotationValidation), quotation_controller_1.deleteQuotation);
        route.post('/update-quotation-status', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(quotation_validation_1.updateQuotationStatusValidation), quotation_controller_1.updateQuotationStatus);
        route.post('/export-quotation', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(quotation_validation_1.exportQuotationValidation), quotation_controller_1.exportQuotationToExcel);
        //admin User Create
        route.post("/admin-user-create", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(admin_store_validation_1.default), auth_controller_1.storeAdminUser);
        route.post("/admin-user-update", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(admin_store_validation_1.default), auth_controller_1.updateAdminUser);
        route.post("/admin-user-delete", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(admin_login_validation_1.deleteUserListValidation), auth_controller_1.deleteUserList);
        route.get("/admin-user-list", auth_middleware_1.protectedRoute, auth_controller_1.adminUserList);
        route.post("/import-users", auth_middleware_1.protectedRoute, exports.upload.single("file"), auth_controller_1.importUsersExcelFormet);
        //user list
        route.get("/get-user-list", auth_middleware_1.protectedRoute, auth_controller_1.userList);
        route.post("/user-create", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(admin_login_validation_1.createUserValidation), auth_controller_1.userCreate);
        route.get("/user-details/:id", auth_middleware_1.protectedRoute, auth_controller_1.userDetailsDelete);
        route.post("/user-action", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(admin_login_validation_1.actionUserValidation), auth_controller_1.actionUserController);
        //category module
        route.get("/delete-all-category", auth_middleware_1.protectedRoute, category_controller_1.deleteAllCategory);
        route.get("/get-category-list", auth_middleware_1.protectedRoute, category_controller_1.getCategoryList);
        route.get("/get-admin-all-category-list", auth_middleware_1.protectedRoute, category_controller_1.getAdminAllCategoryList);
        route.post("/store-category", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(category_store_validation_1.categoryStoreSchema), category_controller_1.storeCategory);
        route.get("/get-category-details/:category_id", auth_middleware_1.protectedRoute, category_controller_1.getCategoryDetails);
        route.post("/update-catgeory/:category_id", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(category_store_validation_1.categoryStoreSchema), category_controller_1.categoryUpdate);
        route.post("/delete-category", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(category_store_validation_1.categorydeleteSchema), category_controller_1.categoryDelete);
        route.post("/sort-category-list", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(category_store_validation_1.categorysortSchema), category_controller_1.categorySorting);
        route.get("/get-disable-category-list", auth_middleware_1.protectedRoute, category_controller_1.getdisableCategoryList);
        route.post("/category-action", (0, validation_middleware_1.validateRequest)(category_store_validation_1.categoryActionSchema), auth_middleware_1.protectedRoute, category_controller_1.categoryAction);
        route.get("/export-category", category_controller_1.exportCategoriesToExcel);
        route.post("/import-categories", auth_middleware_1.protectedRoute, exports.upload.single("file"), category_controller_1.importCategoriesFromExcel);
        route.get("/export-category-soring", category_controller_1.exportSortingCategory);
        route.post("/import-category-sorting", auth_middleware_1.protectedRoute, exports.upload.single("file"), category_controller_1.importSortingCategory);
        //JOb category module
        route.get("/delete-all-job-category", auth_middleware_1.protectedRoute, jobModule_controller_1.deleteAllJobCategory);
        route.get("/get-job-category-list", auth_middleware_1.protectedRoute, jobModule_controller_1.getJobCategoryList);
        route.post("/store-job-category", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(jobModule_validation_1.jobCategoryStoreSchema), jobModule_controller_1.storeJobCategory);
        route.get("/get-job-category-details/:category_id", auth_middleware_1.protectedRoute, jobModule_controller_1.getJobCategoryDetails);
        route.post("/update-job-catgeory/:category_id", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(jobModule_validation_1.jobCategoryStoreSchema), jobModule_controller_1.JobCategoryUpdate);
        route.post("/delete-job-category", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(jobModule_validation_1.jobCategorydeleteSchema), jobModule_controller_1.jobCategoryDelete);
        route.post("/sort-job-category-list", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(jobModule_validation_1.jobCategorysortSchema), jobModule_controller_1.jobCategorySorting);
        route.get("/get-disable-job-category-list", auth_middleware_1.protectedRoute, jobModule_controller_1.getdisableJobCategoryList);
        route.post("/job-category-action", (0, validation_middleware_1.validateRequest)(jobModule_validation_1.jobCategoryActionSchema), auth_middleware_1.protectedRoute, jobModule_controller_1.jobCategoryAction);
        route.get("/export-job-category", jobModule_controller_1.exportJobCategoriesToExcel);
        route.post("/import-job-categories", auth_middleware_1.protectedRoute, exports.upload.single("file"), jobModule_controller_1.importJobCategoriesFromExcel);
        //Jobs
        route.get("/delete-all-jobs", auth_middleware_1.protectedRoute, jobModule_controller_1.deleteAllJobs);
        route.post('/store-job', (0, validation_middleware_1.validateRequest)(jobModule_validation_1.storeJobValidation), jobModule_controller_1.storeJob);
        route.post('/get-job-list', auth_middleware_1.protectedRoute, jobModule_controller_1.getJobList);
        route.post('/get-job-details/:job_id', auth_middleware_1.protectedRoute, jobModule_controller_1.getJobDetails);
        route.post('/update-job-details/:job_id', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(jobModule_validation_1.storeJobValidation), jobModule_controller_1.updateJobDetails);
        route.get('/get-job-applications', auth_middleware_1.protectedRoute, jobModule_controller_1.getJobApplication);
        route.post("/delete-jobs", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(jobModule_validation_1.deleteJobValidation), jobModule_controller_1.jobDelete);
        //blog ctegory
        route.get('/blog-category-list', auth_middleware_1.protectedRoute, blog_category_controller_1.getBlogCategoryList);
        route.get('/delete-all-blog-category', auth_middleware_1.protectedRoute, blog_category_controller_1.deleteAllBlogCategory);
        route.post("/store-blog-category", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.blogCategoryStoreSchema), blog_category_controller_1.storeBlogCategory);
        route.get("/edit-blog-category/:blog_category_id", auth_middleware_1.protectedRoute, blog_category_controller_1.getBlogCategoryDetails);
        route.post("/update-blog-category", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.blogCategoryUpdateSchema), blog_category_controller_1.updateBlogCategory);
        route.post("/delete-blog-category", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.blogCategoryDeleteSchema), blog_category_controller_1.deleteBlogCategory);
        route.get("/export-blog-category", blog_category_controller_1.exportBlogCategoriesToExcel);
        route.post("/import-blog-categories", auth_middleware_1.protectedRoute, exports.upload.single("file"), blog_category_controller_1.importBlogCategoriesFromExcel);
        //blog
        route.get('/blog-list', auth_middleware_1.protectedRoute, blog_controller_1.getBlogList);
        route.get('/delete-all-blogs', auth_middleware_1.protectedRoute, blog_controller_1.deleteAllBlogList);
        route.post('/add-blog-details', auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.storeBlogDetailsSchema), blog_controller_1.storeBlog);
        route.get('/blog-details/:id', auth_middleware_1.protectedRoute, blog_controller_1.blogDetails);
        route.post('/update-blog-details', (0, validation_middleware_1.validateRequest)(blog_validation_1.updateBlogDetailsSchema), auth_middleware_1.protectedRoute, blog_controller_1.updateBlog);
        route.post("/delete-blog", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(blog_validation_1.blogDeleteSchema), blog_controller_1.deleteBlog);
        route.post("/delete-country", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.deleteCountrySchema), location_controller_1.deleteCountry);
        route.get("/get-form-country-list", location_controller_1.getFormCountry);
        route.get("/get-form-state-list", location_controller_1.getFormState);
        route.get("/get-form-city-list", location_controller_1.getFormCity);
        route.get("/get-form-area-list", location_controller_1.getFormArea);
        //location (country) module
        route.get("/get-admin-country-list", auth_middleware_1.protectedRoute, location_controller_1.getAdminCountryList);
        route.get('/delete-all-country', auth_middleware_1.protectedRoute, location_controller_1.deleteAllCountry);
        route.post("/store-country", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.countryStoreSchema), location_controller_1.storeCountry);
        route.post("/update-country/:country_id", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.countryStoreSchema), location_controller_1.updateCountry);
        route.get('/country-details/:id', auth_middleware_1.protectedRoute, location_controller_1.countryDetails);
        route.post("/delete-country", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.deleteCountrySchema), location_controller_1.deleteCountry);
        route.get("/export-country", location_controller_1.exportCountryToExcel);
        route.post("/import-countries", auth_middleware_1.protectedRoute, exports.upload.single("file"), location_controller_1.importCountriesFromExcel);
        //location (state) module
        route.get('/delete-all-state', auth_middleware_1.protectedRoute, location_controller_1.deleteAllState);
        route.get("/get-admin-state-list", auth_middleware_1.protectedRoute, location_controller_1.getAdminStateList);
        route.get('/state-details/:id', auth_middleware_1.protectedRoute, location_controller_1.stateDetails);
        route.post("/store-state", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.statusStoreSchema), location_controller_1.storeState);
        route.post("/update-state/:state_id", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.statusStoreSchema), location_controller_1.updateState);
        route.post("/delete-state", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.deleteStateSchema), location_controller_1.deleteState);
        route.get("/export-state", location_controller_1.exportStateToExcel);
        route.post("/import-states", auth_middleware_1.protectedRoute, exports.upload.single("file"), location_controller_1.importStatesFromExcel);
        //route for city module
        route.get('/delete-all-city', auth_middleware_1.protectedRoute, location_controller_1.deleteAllCity);
        route.get("/get-admin-city-list", auth_middleware_1.protectedRoute, location_controller_1.getAdminCityList);
        route.get("/city-action/:city_id", auth_middleware_1.protectedRoute, location_controller_1.cityAction);
        route.get("/get-top-city", auth_middleware_1.protectedRoute, location_controller_1.getTopCity);
        route.post("/store-city", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.cityStoreSchema), location_controller_1.storeCity);
        route.post("/update-city/:city_id", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.cityStoreSchema), location_controller_1.updateCity);
        route.post("/delete-city", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.deleteCitySchema), location_controller_1.deleteCity);
        route.get("/export-city", location_controller_1.exportCityToExcel);
        route.post("/import-city", auth_middleware_1.protectedRoute, exports.upload.single("file"), location_controller_1.importCityFromExcel);
        route.get('/city-details/:id', auth_middleware_1.protectedRoute, location_controller_1.cityDetails);
        route.get("/user-action-activity-list", superadmin_middleware_1.superadminRoute, userActionActivity_controller_1.userActionActivityList);
        //route for area module
        route.get('/delete-all-area', auth_middleware_1.protectedRoute, location_controller_1.deleteAllArea);
        route.get("/get-admin-area-list", auth_middleware_1.protectedRoute, location_controller_1.getAdminAreaList);
        route.post("/store-area", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.areaStoreSchema), location_controller_1.storeArea);
        route.post("/update-area/:area_id", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.areaStoreSchema), location_controller_1.updateArea);
        route.post("/delete-area", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(location_validation_1.deleteAreaSchema), location_controller_1.deleteArea);
        route.get("/export-area", location_controller_1.exportAreaToExcel);
        route.post("/import-area", auth_middleware_1.protectedRoute, exports.upload.single("file"), location_controller_1.importAreaFromExcel);
        route.get('/area-details/:id', auth_middleware_1.protectedRoute, location_controller_1.areaDetails);
        // Faq 
        route.get("/get-faq-list", auth_middleware_1.protectedRoute, faq_controller_1.getFaqList);
        route.post("/store-faq", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(faq_validation_1.faqStoreSchema), faq_controller_1.storeFaq);
        route.post("/update-faq", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(faq_validation_1.faqUpdateSchema), faq_controller_1.updateFaq);
        route.post("/delete-faq", auth_middleware_1.protectedRoute, (0, validation_middleware_1.validateRequest)(faq_validation_1.faqDeleteSchema), faq_controller_1.deleteFaq);
        route.get('/faq-details/:id', auth_middleware_1.protectedRoute, faq_controller_1.faqDetails);
        // get faq frontend
        route.get("/get-faq", faq_controller_1.getFaqList);
    }
    catch (error) {
        // Log any errors that occur during route definition
        console.log(error, 'warn');
    }
};
exports.appRoute = appRoute;
//# sourceMappingURL=app.routes.js.map