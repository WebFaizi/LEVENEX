import express from "express";
import multer from "multer";
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });
import { protectedRoute } from "../../middleware/auth.middleware";
import { superadminRoute } from "../../middleware/superadmin.middleware";
import { protectedFrontendRoute } from "../../middleware/frontend_auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { uploadImagesFile } from "../../helper/helper";
import { adminLoginSchema,checkSuperadminUserValidation,resetPasswordValidation,updatePasswordValidation,deleteUserListValidation,createUserValidation,actionUserValidation,updateUserProfileDetailsValidation,userUpdatePasswordValidation,sendOtpValidation,verifyOtpValidation } from "../../utils/validation-schems/admin_login.validation";
import { loginUser,storeAdminUser,adminUserList,userList,userDetails,frontendUserDetails,updateUserProfileDetails,userUpdatePassword,userCreate,userDetailsDelete,checkSuperadminUser,getAllPendingOtp,updatePassword,userActivityList,getAllUsersList,updateAdminUser,deleteUserList,actionUserController,forgotPassword,resetPassword,loginOtpGenerate,loginOtpVerify,logoutAllAdminUser,getLiveUserList,importUsersExcelFormet, getuserByToken } from "../controllers/auth.controller";
import   adminStoreSchema from "../../utils/validation-schems/admin_store.validation";
import { countryStoreSchema,deleteCountrySchema,statusStoreSchema,deleteStateSchema,cityStoreSchema,deleteCitySchema,areaStoreSchema,deleteAreaSchema,searchCityAreaValidation,submitContactUsFormValidation } from "../../utils/validation-schems/location.validation";
import { categoryStoreSchema,categorydeleteSchema,categorysortSchema,categoryActionSchema } from "../../utils/validation-schems/category_store.validation";
import { getCategoryList,getAdminAllCategoryList,deleteAllCategory,storeCategory,getCategoryDetails,categoryUpdate,categoryDelete,categorySorting,exportCategoriesToExcel,importCategoriesFromExcel,getdisableCategoryList,categoryAction, exportSortingCategory, importSortingCategory } from "../controllers/category.controller";
import { getAdminCountryList,deleteAllCountry,deleteAllState,deleteAllCity,deleteAllArea,storeCountry,updateCountry ,deleteCountry,exportCountryToExcel,importCountriesFromExcel,getAdminStateList,storeState,updateState,deleteState,exportStateToExcel,importStatesFromExcel,getAdminCityList,storeCity,cityAction,getTopCity,updateCity,deleteCity,exportCityToExcel,importCityFromExcel,storeArea,getAdminAreaList,updateArea,deleteArea,exportAreaToExcel,importAreaFromExcel,getFormCountry,getFormState,getFormCity,getFormArea,searchCityOrArea, stateDetails, countryDetails, cityDetails, areaDetails } from "../controllers/location.controller";
import { blogCategoryStoreSchema,blogCategoryUpdateSchema,blogCategoryDeleteSchema,updateBlogDetailsSchema,storeBlogDetailsSchema,blogDeleteSchema,addUserBlogReviewValidation,addUserListingReviewValidation,reviewDeleteSchema,reviewapproveSchema,addAdminBlogReviewValidation } from "../../utils/validation-schems/blog.validation";
import { storeBlogCategory ,getBlogCategoryList,deleteAllBlogCategory ,getBlogCategoryDetails,updateBlogCategory,deleteBlogCategory ,exportBlogCategoriesToExcel,importBlogCategoriesFromExcel } from "../controllers/blog_category.controller";
import { getBlogList,deleteAllBlogList,storeBlog,blogDetails,updateBlog,deleteBlog,getBlogReviewList,getBlogListFrontend,getBlogDetailFrontend,addUserBlogReview,addUserListingReview,deleteBlogReviewList,approveReviewList,getReviewImportExcel,importBlogReview,getAllBlogList,addAdminBlogReview,storeBlogByUser } from "../controllers/blog.controller";


//ipaddress files
import { userActionActivityList }  from "../controllers/userActionActivity.controller";

import { storeIpAddress,deleteAllIp,listIpAddress,deleteIpAddress } from "../controllers/ipAddress.controller";
import { ipAddressValidation,deleteIpAddressValidation }  from "../../utils/validation-schems/ipAddress.validation";

//IP Blacklist
import { getIpBlacklist, addIpBlacklist, updateIpBlacklist, deleteIpBlacklist, checkIpBanned, getIpBlacklistStats } from "../controllers/ipBlacklist.controller";
import { addIpBlacklistValidation, updateIpBlacklistValidation, deleteIpBlacklistValidation, checkIpBannedValidation } from "../../utils/validation-schems/ipBlacklist.validation";

//quotation calidation
import { quotationStoreValidation,deleteQuotationValidation,
    updateQuotationStatusValidation,exportQuotationValidation,addFrontendQoutationValidation,deleteSubscribersValidation }  from "../../utils/validation-schems/quotation.validation";
import { storeQuotation ,getQuotationList,deleteQuotation,
    updateQuotationStatus,exportQuotationToExcel,addQoutation,getSubscribersExcelFormet,ExportSubscribers,ImportSubscribers,getSubscriberList,deleteSubscribers,sendMailSubscribers} from "../controllers/quotation.controller";

// import { getUsersProfiles, imageCaptionUpdate, imageUpload, removeImages, removeSingleImage, setProfileImage, updateUserProfile } from "../controllers/user.controller";

//Redirects URLS
import { storeRedirectsUrl,getRedircetsUrlList,deleteRedirectUrl,getUrlExcelFormet,deleteAllRedirects,getRedirectUrlExport,redirectUrlImport, redirectDetails } from "../controllers/redirectsUrl.controller";   
import { redirectsUrlStoreSchema ,deleteRedircetsUrlValidation} from "../../utils/validation-schems/redirectsUrl.validation";

//static page
import { storeStaticPage,deleteAllStaticPages,getStaticPageList,getStaticPageDetails,updateStaticPageDetails,deleteStaticPage } from "../controllers/staticPage.controller";
import { staticPageValidation,deleteStaticPageValidation } from "../../utils/validation-schems/staticPage.validation";

//settings
import { storeTheme,getTheme,updateSetting,clearSetting,getSetting,updateFooterDescription,updateDesktopDescription,getDashboardDetails,getAllListingData,getAllUserData,getPremiumRequest,getFrontendSetting,checkRedirectCurrentUrl,getFrontendFooter,getFrontendAds, exportedBackgroundProcessList } from "../controllers/setting.controller";
import { themePageValidation } from "../../utils/validation-schems/theme.validation";
import { settingValidation,footerDescriptionValidation,desktopDescriptionValidation, } from "../../utils/validation-schems/setting.validation";

//seo
import { homePageSeoValidation,categorySeoValidation,categorySeoDetailValidation,subdomainCategorySeoValidation,subdomainCategorySeoDetailValidation,listingSeoDetailValidation,listingSeoValidation,serverSideMetaDetailsValidation } from "../../utils/validation-schems/seo.validation";
import { updateHomePageSeo,getHomePageSeo,importHomepageSeoData,exportHomepageSeoData,updateCategorySeo,getCategorySeoDetails,exportCategorySeoDetails,getCategorySeoList,importCategorySeo,updateSubdomainCategorySeo,getSubdomainCategorySeoDetails,exportSubcategoryCategorySeoDetails,getSubdomainCategorySeoList,importSubdomainCategorySeo,getListingSeoList,exportListingSeoDetails,updateListingSeo,getListingSeoDetails,importListingSeo,serverSideMetaDetails} from "../controllers/seo.controller";

//banner
import { storeBannerTypeValidation,bannerTypesidValidation,deleteBannerTypeSchema,storeBannerValidation,deleteBannerSchema,storeBannerThemeValidation } from "../../utils/validation-schems/advertisig.validation";
import { storeBannerType,getBannerTypesList,getBannerTypesDetails,updateBannerType,deleteBannerType,deletetAllBanners,storeBanner,deleteAllbannerType,getBannerList,getBannerDetails,updateBanner,deleteBanner,getBannerThemeList,getBannerThemeDetails,updateBannerTheme } from "../controllers/advertising.controller";

//listing
import { listingStoreValidation,deleteListingValidation,listingStatusValidation,listingBannerValidation,addAdminListingReviewValidation } from "../../utils/validation-schems/listing.validation";
import { storeListingData,deleteAllListings,updateListingData,getListingList,getUserListingList,getListingReviewList,listingDetails,deleteListings,listingsStatusUpdate,listingExportFormetDownload,importListing,importFreshListing,categoryWiseExport,importCategoryWiseListing,exportListing,listingBanners,updateListingBanners,deleteDuplicateListing,deleteReviewList,importListingReview,getAllListingList,addAdminListingReview,userAllListingList,importUserListing } from "../controllers/listing.controller";

//featured Listing
import { featuredlistingStoreValidation,deleteFeaturedlistingValidation,addchatboatlistingValidation,deleteChatboatlistingValidation } from "../../utils/validation-schems/featuredListing.validation";
import { storeFeaturedListing,getFeaturedListingList,deleteAllFeaturedListings,getFeaturedListingDetails,exportFeaturedListing,importFeaturedListing,deleteFeaturedlisting } from "../controllers/featuredListing.controller";

//chatboat Listing
// import {  } from "../../utils/validation-schems/chatboatListing.validation";
import { getChatboatListingList,getListingCityWise,deleteAllChatboatListings,storeChatboatListing,getChatboatListingDetails,deleteChatboatlisting,chatBoatUserList,ChatBoatUserExport,storeChatBoatUser,clearChatBoat } from "../controllers/chatboatListing.controller";

//featured Listing
import { premiumListingStoreValidation,deletePremiumListingStoreValidation,storeChatBoatUserValidation } from "../../utils/validation-schems/premiumListing.validation";
import { storePremiumListingData,getPremiumListingList,deletePremiumListingList,getPremiumListingDetails,updatePremiumListingData,importPremiumListing } from "../controllers/premiumListing.controller";

//chatboar Listing and user
// import {  } from "../../utils/validation-schems/chatboat.validation";
import { chatboatListing} from "../controllers/chatboat.controller";

//Product Listing
import { productStoreValidation,deleteProductListingValidation,removeProductImageValidation } from "../../utils/validation-schems/productListing.validation";
import { storeProductListing,listingProductList,deleteAllProduct,listingProductDetails,deleteProductListing,updateProductListing,exportProduct,importProduct,removeProductImage } from "../controllers/productListing.controller";

//Keyword Listing
// import {  } from "../../utils/validation-schems/keywords.validation";
import { getKeywords ,exportKeywordExcel,importKeyword,deleteAllKeywords,deleteKeywords,updateKeywords} from "../controllers/keywords.controller";

//Newsletter
import { updateNewsletterValidation } from "../../utils/validation-schems/newsletter.validation";
import { updateNewsletter,newsletterDetails } from "../controllers/newsletter.controller";

//Marketing Banner
import { updateMarketingBannerValidation,customUrlValidation,getGeneratedUrlValidation,deleteKeywordValidation,updateKeywordValidation } from "../../utils/validation-schems/marketingBanner.validation";
import { updateMarketingBanner,marketingBannerDetails } from "../controllers/marketingBanner.controller";

import { generateSitemaps } from "../controllers/sitemap.controller";
import { generateListingSitemaps } from "../controllers/listingSitemap.controller";
import { generateFeaturedSitemaps } from "../controllers/featuredListingSitemap.controller";
import { generateProductSitemaps } from "../controllers/productSitemap.controller";
import { generateProductDetailsSitemaps } from "../controllers/productDetailsSitemap.controller";
import { generateBlogDetailsSitemaps } from "../controllers/blogSitemap.controller";
import { generateSearchKeywordSitemaps } from "../controllers/searchKeyword.controller";
import { generateCustomSitemaps,updateCustomSitemaps } from "../controllers/customSitemap.controller";
import { generateJobCategorySitemaps } from "../controllers/jobCategorySitemap.controller";
import { generateJobSitemaps } from "../controllers/jobsSitemap.controller";
import { getGenerateSitemaps } from "../controllers/getGeneratedSitemapsUrl.controller";

//frontend controller and validation

import { forntendLoginValidation,forntendRegistrationValidation } from "../../utils/validation-schems/admin_login.validation";
import { frontendLogin,frontendRegistration } from "../controllers/auth.controller";

import { homePageValidation,getChatboatListingValidation,unsubdcribeSiteValidation,storeCategorySearchCountValidation } from "../../utils/validation-schems/frontend.validation";
import { homePage,getChatboatListing } from "../controllers/homepage.controller";

import { frontend_validation,getListingDetailsValidation,jobApplyValidation,storePremiumRequestValidation } from "../../utils/validation-schems/frontend.validation";
import { getSlugWiseResponse,getListingDetails,getListingWiseReviewList,getBlogWiseReviewList,getListingCategoryWise,getCategoryWiseProductList,getListingWiseProductList,sitemapData,getSeachCategory,getStaticPage,submitContactUsForm,sitemapFronendUrls,storePremiumRequest,unsubscribeSite,categorySearchCountList,storeCategorySearchCount, getAllListingWithSlug, getListingStaticData, getAllBlogsSlug } from "../controllers/frontend.controller";
import { validationErrorWithData } from "../../helper/apiResponse";

//Job Module
import {  jobCategoryStoreSchema,jobCategorydeleteSchema,jobCategorysortSchema,jobCategoryActionSchema,storeJobValidation,deleteJobValidation } from "../../utils/validation-schems/jobModule.validation";
import { getJobCategoryList,deleteAllJobCategory,deleteAllJobs,storeJobCategory,getJobCategoryDetails,JobCategoryUpdate,jobCategoryDelete,jobCategorySorting,getdisableJobCategoryList,jobCategoryAction,exportJobCategoriesToExcel,importJobCategoriesFromExcel,storeJob,getJobList,getJobDetails,updateJobDetails,jobDelete,getJobApplication } from "../controllers/jobModule.controller";

//job module frontend

import { getFrontendJobCategoryList,getFrontendJobList,getFrontendJobDetails,applyForJob } from "../controllers/jobModule.controller";

//user Product Listing
// import { productStoreValidation,deleteProductListingValidation } from "../../utils/validation-schems/productListing.validation";
import { userProductList,storeProductByUser } from "../controllers/productListing.controller";
import { deleteFaq, faqDetails, getFaqList, storeFaq, updateFaq } from "../controllers/faq.controller";
import { faqDeleteSchema, faqStoreSchema, faqUpdateSchema } from "../../utils/validation-schems/faq.validation";
const route = express.Router();

    export const appRoute = (router: express.Router): void => {
        try {
            
            router.use('/v1', route)

            route.post('/get-server-side-metadetails',validateRequest(serverSideMetaDetailsValidation),serverSideMetaDetails)

            //frontend routs
            route.post('/forgot-password',validateRequest(checkSuperadminUserValidation),forgotPassword);
            route.post('/reset-password',validateRequest(resetPasswordValidation),resetPassword);
            route.post('/store-premium-request',validateRequest(storePremiumRequestValidation),storePremiumRequest);
            route.post('/unsubscribe-site', validateRequest(unsubdcribeSiteValidation), unsubscribeSite);
            route.get("/get-user-by-token/:token",protectedRoute,getuserByToken)
            route.get("/get-frontenduser-by-token/:token",getuserByToken)
            
            //common url 
            route.get('/get-listing-details-data',validateRequest(getListingDetailsValidation),getListingDetails);
            route.get('/get-all-listing-slug', getAllListingWithSlug)
            route.get('/get-all-blogs-slug', getAllBlogsSlug);
            route.get('/get-listing-preview-data',validateRequest(getListingDetailsValidation),getListingStaticData)
            //add search count
            route.post('/store-category-search-count',validateRequest(storeCategorySearchCountValidation),storeCategorySearchCount);
            
            route.get('/category-search-count-list',categorySearchCountList);

            //get listing category wise
            route.get('/get-listing-category-wise',getListingCategoryWise);

            //get category wise product list 
            route.get('/get-category-wise-product-list',getCategoryWiseProductList);

            //get listing wise product list
            route.get('/get-listing-wise-product-list',getListingWiseProductList);

            //get data of listing wise review
            route.get('/get-review-listing-wise',getListingWiseReviewList);

            //get data of blog wise review
            route.get('/get-review-blog-wise',getBlogWiseReviewList);

            //sitemap frotend
            route.get('/sitemap-urls',sitemapFronendUrls);
            
            //job module
            route.get('/get-job-category',getFrontendJobCategoryList);
            route.get('/get-category-wise-job',getFrontendJobList);
            route.get('/get-job-details',getFrontendJobDetails);
            
            route.post('/apply-for-job',validateRequest(jobApplyValidation),applyForJob);

            route.post('/frontend-login',validateRequest(forntendLoginValidation),frontendLogin);
            route.post('/frontend-registration',validateRequest(forntendRegistrationValidation),frontendRegistration);
            
            //search city or area
            route.get('/search-city-area',validateRequest(searchCityAreaValidation),searchCityOrArea);

            //setting 
            route.get('/frontend-settings',getFrontendSetting);
            route.get('/frontend-footer',getFrontendFooter);
            route.get('/frontend-ads',getFrontendAds);
            route.get('/check-redirect-url',checkRedirectCurrentUrl);
            route.get('/get-static-page',getStaticPage);
            route.post('/submit-contact-us-form',validateRequest(submitContactUsFormValidation),submitContactUsForm);
            route.get('/search-category',getSeachCategory);

            //user listing

            route.post('/user-store-listing-data',protectedRoute,validateRequest(listingStoreValidation),storeListingData);
            route.post('/user-update-listing-data',protectedRoute,validateRequest(listingStoreValidation),updateListingData);
            route.get("/get-user-listing-list",protectedRoute,getUserListingList)
            route.get("/get-user-listing-details/:listing_id",protectedRoute,listingDetails)
            route.post("/delete-user-listings",protectedRoute,validateRequest(deleteListingValidation),deleteListings);
            
            //user product list

            route.get('/user-listing-product-list',protectedRoute,userProductList);
            route.get('/user-all-listing-list',protectedRoute,userAllListingList);
            route.post('/store-product-by-user',protectedRoute,validateRequest(productStoreValidation),storeProductByUser);
            route.get('/user-product-details/:product_id',protectedRoute,listingProductDetails);
            route.post('/remove-Product-image/',validateRequest(removeProductImageValidation),protectedRoute,removeProductImage);
            route.post('/update-user-product',protectedRoute,validateRequest(productStoreValidation),updateProductListing);
            route.post("/delete-user-product",protectedRoute,validateRequest(deleteProductListingValidation),deleteProductListing)

            //home page
            route.post('/home-page',validateRequest(homePageValidation),homePage);
            
            //chat moule
            route.post('/get-chatboat-listing',validateRequest(getChatboatListingValidation),getChatboatListing)
            route.post('/add-quotation-frontend',validateRequest(addFrontendQoutationValidation),addQoutation);

            //user profile
            route.get('/get-user-profile-details',protectedRoute,frontendUserDetails);
            route.get('/get-live-user-list',protectedRoute,getLiveUserList);
            route.post('/update-user-profile-details',validateRequest(updateUserProfileDetailsValidation),protectedRoute,updateUserProfileDetails);
            route.post('/update-user-password',protectedRoute,validateRequest(userUpdatePasswordValidation),userUpdatePassword);
            
            //blogmodule
            route.get('/frontend-blog-list',getBlogListFrontend);
            route.post('/store-blog-by-user',protectedFrontendRoute,validateRequest(storeBlogDetailsSchema),storeBlogByUser);
            route.get('/frontend-blog-details/:blog_id',getBlogDetailFrontend);
            route.post('/add-user-blog-review',protectedFrontendRoute,validateRequest(addUserBlogReviewValidation),addUserBlogReview);
            route.post('/add-user-listing-review',protectedFrontendRoute,validateRequest(addUserListingReviewValidation),addUserListingReview);


            route.get('/get-slug-wise-data',protectedFrontendRoute,getSlugWiseResponse);

            route.get('/sitemap-data',sitemapData);
            //end Frontedn API                        

            //start Admin Api
            route.get('/get-premium-request',protectedRoute,getPremiumRequest);
            route.get('/logout-all-admin-user',protectedRoute,logoutAllAdminUser);
            
            //login with otp
            route.post('/send-admin-login-otp',validateRequest(sendOtpValidation),loginOtpGenerate);
            route.post('/verify-login-otp',validateRequest(verifyOtpValidation),loginOtpVerify);
            
            //sitemap.xml
            route.get('/dashboard-details',protectedRoute,getDashboardDetails);
            route.get('/get-blog-reviewList',protectedRoute,getBlogReviewList)
            route.get('/get-listing-reviewList',protectedRoute,getListingReviewList)
            route.post('/delete-listing-reviewlist',protectedRoute,validateRequest(reviewDeleteSchema),deleteReviewList)
            route.post('/delete-blog-reviewlist',protectedRoute,validateRequest(reviewDeleteSchema),deleteBlogReviewList)
            route.post('/approve-reviews',protectedRoute,validateRequest(reviewapproveSchema),approveReviewList)
            route.get("/get-review-import-excel-formet",protectedRoute,getReviewImportExcel)

            route.get("/get-all-user",protectedRoute,getAllUsersList)
            route.get("/get-all-blog",protectedRoute,getAllBlogList)
            route.get("/get-all-listing",protectedRoute,getAllListingList)
            route.post('/add-blog-review',protectedRoute,validateRequest(addAdminBlogReviewValidation),addAdminBlogReview)
            route.post('/add-listing-review',protectedRoute,validateRequest(addAdminListingReviewValidation),addAdminListingReview)
            
            //all listing and all user 
            route.get('/get-all-listing',protectedRoute,getAllListingData)
            route.get('/get-all-user',protectedRoute,getAllUserData)
            route.post("/import-blog-reviews",protectedRoute,upload.single("file"),importBlogReview);
            route.post("/import-listing-reviews",protectedRoute,upload.single("file"),importListingReview);
            route.get('/generate-category-sitemap',protectedRoute,generateSitemaps);
            route.get('/generate-listing-sitemap',protectedRoute,generateListingSitemaps);
            route.get('/generate-featured-listing-sitemap',protectedRoute,generateFeaturedSitemaps);
            route.get('/generate-product-sitemap',protectedRoute,generateProductSitemaps);
            route.get('/generate-product-details-sitemap',protectedRoute,generateProductDetailsSitemaps);
            route.get('/generate-blog-details-sitemap',protectedRoute,generateBlogDetailsSitemaps);
            route.get('/generate-search-keyword-sitemap',protectedRoute,generateSearchKeywordSitemaps);
            route.get('/generate-job-category-sitemap',protectedRoute,generateJobCategorySitemaps);
            route.get('/generate-jobs-sitemap',protectedRoute,generateJobSitemaps);
            route.post('/generate-custom-sitemap',protectedRoute,validateRequest(customUrlValidation),generateCustomSitemaps);
            route.get('/generated-sitemap-urls',protectedRoute,validateRequest(getGeneratedUrlValidation),getGenerateSitemaps);
            route.get('/get-custom-sitemap-urls',protectedRoute,updateCustomSitemaps);
            
            //Newsletter
            route.post('/update-newsletter',protectedRoute,validateRequest(updateNewsletterValidation),updateNewsletter);
            route.get('/newsletter-details',protectedRoute,newsletterDetails);

            //Newsletter
            route.post('/update-marketing-banner',protectedRoute,validateRequest(updateMarketingBannerValidation),updateMarketingBanner);
            route.get('/marketing-banner-details',protectedRoute,marketingBannerDetails);

            route.get('/get-subscribers-excel-formet',protectedRoute,getSubscribersExcelFormet);
            route.get('/export-subscribers',protectedRoute,ExportSubscribers);
            route.post('/import-subscribers',protectedRoute,upload.single("file"),ImportSubscribers);
            route.get('/get-subscribers-list',protectedRoute,getSubscriberList);
            route.post("/delete-subscribers",protectedRoute,validateRequest(deleteSubscribersValidation),deleteSubscribers)
            route.get("/send-mail-subscribers",protectedRoute,sendMailSubscribers)

            //Keywords List
            route.get('/delete-all-keyword',superadminRoute,deleteAllKeywords);
            route.get("/get-keywords",protectedRoute,getKeywords)
            route.post("/import-keywords",protectedRoute,upload.single("file"),importKeyword);
            route.get("/export-keywords",protectedRoute,exportKeywordExcel);
            route.post("/delete-keywords",protectedRoute,validateRequest(deleteKeywordValidation),deleteKeywords)
            route.post("/update-keyword",protectedRoute,validateRequest(updateKeywordValidation),updateKeywords)
            
            //Listing Product Module
            route.get('/delete-all-product',superadminRoute,deleteAllProduct);
            route.post('/store-listing-product',protectedRoute,validateRequest(productStoreValidation),storeProductListing);
            route.post('/update-listing-product',protectedRoute,validateRequest(productStoreValidation),updateProductListing);
            route.get('/listing-product-list',protectedRoute,listingProductList);
            route.get('/listing-product-details/:product_id',protectedRoute,listingProductDetails);
            route.post("/delete-product-listing",protectedRoute,validateRequest(deleteProductListingValidation),deleteProductListing)
            route.get("/export-product",protectedRoute,exportProduct);
            route.post("/import-product",protectedRoute,upload.single("file"),importProduct);

            //PremiumLIsting Module.
            route.post('/store-premium-listing',protectedRoute,validateRequest(premiumListingStoreValidation),storePremiumListingData);
            route.get("/get-premium-listing-list",protectedRoute,getPremiumListingList)
            route.post("/delete-premium-listing",protectedRoute,validateRequest(deletePremiumListingStoreValidation),deletePremiumListingList)
            route.get("/get-premium-listing-details/:listing_id",protectedRoute,getPremiumListingDetails)
            route.post('/update-premium-listing',protectedRoute,validateRequest(premiumListingStoreValidation),updatePremiumListingData);
            
            //Listing Module
            route.get('/delete-all-listing',superadminRoute,deleteAllListings);
            route.post('/store-listing-data',protectedRoute,validateRequest(listingStoreValidation),storeListingData);
            route.post('/update-listing-data',protectedRoute,validateRequest(listingStoreValidation),updateListingData);
            route.get("/get-listing-list",protectedRoute,getListingList)
            route.get("/get-listing-details/:listing_id",protectedRoute,listingDetails)
            route.post("/delete-listings",protectedRoute,validateRequest(deleteListingValidation),deleteListings);
            route.post("/update-listing-status",protectedRoute,validateRequest(listingStatusValidation),listingsStatusUpdate);
            
            //listing Export
            route.get("/get-import-excel-formet",protectedRoute,listingExportFormetDownload)
            route.post("/import-listing",protectedRoute,upload.single("file"),importListing);
            route.post("/import-fresh-listing",protectedRoute,upload.single("file"),importFreshListing);
            route.post("/import-user-listing",protectedRoute,upload.single("file"),importUserListing);
            route.get("/export-listing",protectedRoute,exportListing);
            route.get('/listing-banners',protectedRoute,listingBanners);
            route.post('/update-listing-banners',validateRequest(listingBannerValidation),protectedRoute,updateListingBanners);
            route.get('/category-wise-export/:category_id',protectedRoute,categoryWiseExport);
            route.post('/category-wise-import',protectedRoute,upload.single("file"),importCategoryWiseListing);
            route.post('/delete-duplicate-listing',protectedRoute,deleteDuplicateListing);

            //featured listing
            route.get('/delete-all-featured-listing',superadminRoute,deleteAllFeaturedListings);
            route.post('/add-featured-listing',validateRequest(featuredlistingStoreValidation),protectedRoute,storeFeaturedListing)
            route.get('/get-featured-listing',protectedRoute,getFeaturedListingList)
            route.get('/get-featured-details/:featured_listing_id',protectedRoute,getFeaturedListingDetails)
            route.get("/featured-listing-export",protectedRoute,exportFeaturedListing);
            route.post("/featured-listing-import",protectedRoute,upload.single("file"),importFeaturedListing);
             route.post("/premium-listing-import",protectedRoute,upload.single("file"),importPremiumListing);
            route.post("/delete-featured-listing",protectedRoute,validateRequest(deleteFeaturedlistingValidation),deleteFeaturedlisting);
            
            //chatboat listing
            route.get('/get-chat-boat-listing',protectedRoute,getChatboatListingList)
            route.get('/delete-all-chatboat-listing',superadminRoute,deleteAllChatboatListings);
            route.get('/get-listing-city-wise',protectedRoute,getListingCityWise)
            route.post('/add-chatboat-listing',protectedRoute,validateRequest(addchatboatlistingValidation),storeChatboatListing)
            route.get('/get-chat-boat-listing-details/:chat_boat_listing_id',protectedRoute,getChatboatListingDetails)
            route.post("/delete-chatoat-listing",protectedRoute,validateRequest(deleteChatboatlistingValidation),deleteChatboatlisting);
            route.get('/get-chat-boat-user-listing',protectedRoute,chatBoatUserList)
            route.get('/get-chat-boat-user-export-listing',protectedRoute,ChatBoatUserExport)

            route.get('/chatboat-listing',protectedRoute,chatboatListing)
            route.post('/chatboat-user-store',protectedRoute,validateRequest(storeChatBoatUserValidation),storeChatBoatUser)
            route.post('/clear-chatboat-user',protectedRoute,clearChatBoat)
            
            //admin user activity list
            route.get("/user-activity-list",protectedRoute,userActivityList);
            
            //banner type 
            route.get('/delete-all-bannertype',superadminRoute,deleteAllbannerType);
            route.post("/store-banner-type",protectedRoute,validateRequest(storeBannerTypeValidation),storeBannerType);
            route.get("/get-list-banner-type",protectedRoute,getBannerTypesList)
            route.get("/banner-type-details/:bannertype_id",protectedRoute,getBannerTypesDetails)
            route.post("/update-banner-type",protectedRoute,validateRequest(storeBannerTypeValidation),updateBannerType);
            route.post("/delete-banner-type",protectedRoute,validateRequest(deleteBannerTypeSchema),deleteBannerType);
            
            //banners
            route.get('/delete-all-banners',superadminRoute,deletetAllBanners);
            route.post("/store-banner",protectedRoute,validateRequest(storeBannerValidation),storeBanner);
            route.get("/get-list-banner",protectedRoute,getBannerList)
            route.get("/get-banners-details/:banners_id",protectedRoute,getBannerDetails)
            route.post("/update-banner",protectedRoute,validateRequest(storeBannerValidation),updateBanner);
            route.post("/delete-banner",protectedRoute,validateRequest(deleteBannerSchema),deleteBanner);
            
            //banners theme
            route.get("/get-banner-theme-list",protectedRoute,getBannerThemeList);
            route.get("/get-banner-theme-details/:banners_theme_id",protectedRoute,getBannerThemeDetails)
            route.post("/update-banner-theme",protectedRoute,validateRequest(storeBannerThemeValidation),updateBannerTheme);
            
            //cartegory seo
            route.post("/update-category-seo",protectedRoute,validateRequest(categorySeoValidation),updateCategorySeo);
            route.get("/get-category-seo-details",protectedRoute,validateRequest(categorySeoDetailValidation),getCategorySeoDetails);
            route.get("/export-category-seo-details",protectedRoute,exportCategorySeoDetails);
            route.get("/category-seo-list",protectedRoute,getCategorySeoList);
            route.post("/import-category-seo",protectedRoute,upload.single("file"),importCategorySeo);
            
            //subdoamin cartegory seo
            route.post("/update-subdomain-category-seo",protectedRoute,validateRequest(subdomainCategorySeoValidation),updateSubdomainCategorySeo);
            route.get("/get-subdoamin-category-seo-details",protectedRoute,validateRequest(subdomainCategorySeoDetailValidation),getSubdomainCategorySeoDetails);
            route.get("/export-subdoamin-category-seo-details",protectedRoute,exportSubcategoryCategorySeoDetails);
            route.get("/subdomain-category-seo-list",protectedRoute,getSubdomainCategorySeoList);
            route.post("/subdomain-import-category-seo",protectedRoute,upload.single("file"),importSubdomainCategorySeo);
            
            //homepage seo 
            route.get('/get-homepage-seo-details',protectedRoute,getHomePageSeo);
            route.post("/update-homepage-seo",protectedRoute,validateRequest(homePageSeoValidation),updateHomePageSeo);
            route.get("/export-homepage-seo",exportHomepageSeoData);
            route.post("/import-homepage-seo",protectedRoute, upload.single("file"), importHomepageSeoData);

            //Listing seo
            route.post("/update-listing-seo",protectedRoute,validateRequest(listingSeoValidation),updateListingSeo);
            route.get("/get-listing-seo-details",protectedRoute,validateRequest(listingSeoDetailValidation),getListingSeoDetails);
            route.get("/export-listing-seo-details",protectedRoute,exportListingSeoDetails);
            route.get("/listing-seo-list",protectedRoute,getListingSeoList);
            route.post("/import-listing-seo",protectedRoute,upload.single("file"),importListingSeo);

            //setting data
            route.post("/save-theme-page",protectedRoute,validateRequest(themePageValidation),storeTheme);
            route.get("/get-theme",protectedRoute,getTheme);
            route.post("/update-setting",protectedRoute,validateRequest(settingValidation),updateSetting);
            route.get("/clear-setting",protectedRoute,clearSetting);
            route.get("/get-seeting-details",getSetting);
            
            //static page
            route.get('/delete-all-static-pages',superadminRoute,deleteAllStaticPages);
            route.post("/save-static-page",protectedRoute,validateRequest(staticPageValidation),storeStaticPage);
            route.get("/get-static-page-list",protectedRoute,getStaticPageList);
            route.get("/get-static-page-details/:id",protectedRoute,getStaticPageDetails);
            route.post("/update-static-page-details",protectedRoute,validateRequest(staticPageValidation),updateStaticPageDetails);
            route.post("/delete-static-page/",protectedRoute,validateRequest(deleteStaticPageValidation),deleteStaticPage);
            
            //route for redirects url
            route.get('/delete-all-redirects',protectedRoute,deleteAllRedirects);
            route.post("/store-redirects-url",protectedRoute,validateRequest(redirectsUrlStoreSchema),storeRedirectsUrl);
            route.get('/get-redirects-url',protectedRoute,getRedircetsUrlList);
            route.post('/delete-redirects-url',protectedRoute,validateRequest(deleteRedircetsUrlValidation),deleteRedirectUrl);
            route.get('/get-url-excel-formet',protectedRoute,getUrlExcelFormet);
            route.get('/get-redircet-url-export',protectedRoute,getRedirectUrlExport);
            route.post('/redircet-url-import',protectedRoute,upload.single("file"),redirectUrlImport);
            route.get('/redirect-details/:id',protectedRoute,redirectDetails);

            //update footer_description
            route.post("/update-footer-description",protectedRoute,validateRequest(footerDescriptionValidation),updateFooterDescription);
            route.post("/update-desktop-description",protectedRoute,validateRequest(desktopDescriptionValidation),updateDesktopDescription);
            route.get("/export-tasks", protectedRoute, exportedBackgroundProcessList);
            
            //auth urls
            route.post("/admin-login",validateRequest(adminLoginSchema),loginUser);
            route.get("/get-user-by-token/:token",protectedRoute,getuserByToken)
            route.get("/get-frontenduser-by-token/:token",getuserByToken)
            
            //update password
            route.post("/update-password",protectedRoute,validateRequest(updatePasswordValidation),updatePassword);
            
            //all pending otp
            route.get("/get-all-pending-otp",protectedRoute,getAllPendingOtp);
            
            //Ip Address Module 
            route.get('/delete-all-ip',protectedRoute,deleteAllIp);
            route.post('/add-ip',protectedRoute,validateRequest(ipAddressValidation),storeIpAddress);
            route.get('/ip-address-list',protectedRoute,listIpAddress);
            route.post('/delete-ip-address',protectedRoute,validateRequest(deleteIpAddressValidation),deleteIpAddress);
            
            //IP Blacklist Module
            route.get('/ip-blacklist',protectedRoute,getIpBlacklist);
            route.post('/ip-blacklist',protectedRoute,validateRequest(addIpBlacklistValidation),addIpBlacklist);
            route.put('/ip-blacklist',protectedRoute,validateRequest(updateIpBlacklistValidation),updateIpBlacklist);
            route.delete('/ip-blacklist',protectedRoute,validateRequest(deleteIpBlacklistValidation),deleteIpBlacklist);
            route.get('/check-ip-banned',validateRequest(checkIpBannedValidation),checkIpBanned);
            route.get('/ip-blacklist-stats',protectedRoute,getIpBlacklistStats);
            
            // Test endpoint to see what IP backend detects
            route.get('/my-ip', (req: any, res: any) => {
                const forwarded = req.headers['x-forwarded-for'];
                const realIp = req.headers['x-real-ip'];
                const cfConnectingIp = req.headers['cf-connecting-ip'];
                let ip = '';
                if (forwarded) {
                    ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
                } else if (realIp) {
                    ip = Array.isArray(realIp) ? realIp[0] : realIp.toString();
                } else if (cfConnectingIp) {
                    ip = Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp.toString();
                } else {
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
            route.post("/check-superadmin-user",validateRequest(checkSuperadminUserValidation),checkSuperadminUser);
            
            //quotation module
            route.get("/get-quotation-list",protectedRoute,getQuotationList);
            route.post("/store-quotation",validateRequest(quotationStoreValidation),storeQuotation);
            route.post('/delete-quotation',protectedRoute,validateRequest(deleteQuotationValidation),deleteQuotation);
            route.post('/update-quotation-status',protectedRoute,validateRequest(updateQuotationStatusValidation),updateQuotationStatus);
            route.post('/export-quotation',protectedRoute,validateRequest(exportQuotationValidation),exportQuotationToExcel);
            
            //admin User Create
            route.post("/admin-user-create",protectedRoute,validateRequest(adminStoreSchema),storeAdminUser);
            route.post("/admin-user-update",protectedRoute,validateRequest(adminStoreSchema),updateAdminUser);
            route.post("/admin-user-delete",protectedRoute,validateRequest(deleteUserListValidation),deleteUserList);
            route.get("/admin-user-list",protectedRoute,adminUserList);
            route.post("/import-users",protectedRoute,upload.single("file"),importUsersExcelFormet);
            
            //user list
            route.get("/get-user-list",protectedRoute,userList);
            route.post("/user-create",protectedRoute,validateRequest(createUserValidation),userCreate);
            route.get("/user-details/:id",protectedRoute,userDetailsDelete);
            route.post("/user-action",protectedRoute,validateRequest(actionUserValidation),actionUserController);
            
            //category module
             route.get("/delete-all-category",protectedRoute,deleteAllCategory);
            route.get("/get-category-list",protectedRoute,getCategoryList);
            route.get("/get-admin-all-category-list",protectedRoute,getAdminAllCategoryList);
            route.post("/store-category",protectedRoute,validateRequest(categoryStoreSchema),storeCategory);
            route.get("/get-category-details/:category_id",protectedRoute,getCategoryDetails);
            route.post("/update-catgeory/:category_id",protectedRoute,validateRequest(categoryStoreSchema),categoryUpdate);
            route.post("/delete-category",protectedRoute,validateRequest(categorydeleteSchema),categoryDelete);
            route.post("/sort-category-list",protectedRoute,validateRequest(categorysortSchema),categorySorting);
            route.get("/get-disable-category-list",protectedRoute,getdisableCategoryList);
            route.post("/category-action",validateRequest(categoryActionSchema),protectedRoute,categoryAction);
            route.get("/export-category",exportCategoriesToExcel);
            route.post("/import-categories",protectedRoute, upload.single("file"), importCategoriesFromExcel);
            route.get("/export-category-soring",exportSortingCategory);
            route.post("/import-category-sorting", protectedRoute, upload.single("file"), importSortingCategory)
             //JOb category module
             route.get("/delete-all-job-category",protectedRoute,deleteAllJobCategory);
             route.get("/get-job-category-list",protectedRoute,getJobCategoryList);
             route.post("/store-job-category",protectedRoute,validateRequest(jobCategoryStoreSchema),storeJobCategory);
             route.get("/get-job-category-details/:category_id",protectedRoute,getJobCategoryDetails);
             route.post("/update-job-catgeory/:category_id",protectedRoute,validateRequest(jobCategoryStoreSchema),JobCategoryUpdate);
             route.post("/delete-job-category",protectedRoute,validateRequest(jobCategorydeleteSchema),jobCategoryDelete);
             route.post("/sort-job-category-list",protectedRoute,validateRequest(jobCategorysortSchema),jobCategorySorting);
             route.get("/get-disable-job-category-list",protectedRoute,getdisableJobCategoryList);
             route.post("/job-category-action",validateRequest(jobCategoryActionSchema),protectedRoute,jobCategoryAction);
             route.get("/export-job-category",exportJobCategoriesToExcel);
             route.post("/import-job-categories",protectedRoute, upload.single("file"), importJobCategoriesFromExcel);
            
            //Jobs
            route.get("/delete-all-jobs",protectedRoute,deleteAllJobs);
            route.post('/store-job',validateRequest(storeJobValidation),storeJob);
            route.post('/get-job-list',protectedRoute,getJobList);
            route.post('/get-job-details/:job_id',protectedRoute,getJobDetails);
            route.post('/update-job-details/:job_id',protectedRoute,validateRequest(storeJobValidation),updateJobDetails);
            route.get('/get-job-applications',protectedRoute,getJobApplication);
            route.post("/delete-jobs",protectedRoute,validateRequest(deleteJobValidation),jobDelete)        

            //blog ctegory
            route.get('/blog-category-list',protectedRoute,getBlogCategoryList); 
            route.get('/delete-all-blog-category',protectedRoute,deleteAllBlogCategory); 
            route.post("/store-blog-category",protectedRoute, validateRequest(blogCategoryStoreSchema), storeBlogCategory);
            route.get("/edit-blog-category/:blog_category_id",protectedRoute, getBlogCategoryDetails);
            route.post("/update-blog-category",protectedRoute, validateRequest(blogCategoryUpdateSchema), updateBlogCategory);
            route.post("/delete-blog-category",protectedRoute, validateRequest(blogCategoryDeleteSchema), deleteBlogCategory);
            route.get("/export-blog-category",exportBlogCategoriesToExcel);
            route.post("/import-blog-categories",protectedRoute, upload.single("file"), importBlogCategoriesFromExcel);
            
            //blog
            route.get('/blog-list',protectedRoute,getBlogList); 
            route.get('/delete-all-blogs',protectedRoute,deleteAllBlogList); 
            route.post('/add-blog-details',protectedRoute,validateRequest(storeBlogDetailsSchema),storeBlog); 
            route.get('/blog-details/:id',protectedRoute,blogDetails);
            route.post('/update-blog-details',validateRequest(updateBlogDetailsSchema),protectedRoute,updateBlog);
            route.post("/delete-blog",protectedRoute, validateRequest(blogDeleteSchema), deleteBlog);
            route.post("/delete-country",protectedRoute,validateRequest(deleteCountrySchema),deleteCountry);
            route.get("/get-form-country-list",getFormCountry);
            route.get("/get-form-state-list",getFormState);
            route.get("/get-form-city-list",getFormCity);
            route.get("/get-form-area-list",getFormArea);
            
            //location (country) module
            route.get("/get-admin-country-list",protectedRoute,getAdminCountryList)
            route.get('/delete-all-country',protectedRoute,deleteAllCountry);
            route.post("/store-country",protectedRoute,validateRequest(countryStoreSchema),storeCountry);
            route.post("/update-country/:country_id",protectedRoute,validateRequest(countryStoreSchema),updateCountry);
            route.get('/country-details/:id',protectedRoute,countryDetails);
            route.post("/delete-country",protectedRoute,validateRequest(deleteCountrySchema),deleteCountry);
            route.get("/export-country",exportCountryToExcel);
            route.post("/import-countries",protectedRoute, upload.single("file"), importCountriesFromExcel);
            
            //location (state) module
            route.get('/delete-all-state',protectedRoute,deleteAllState);
            route.get("/get-admin-state-list",protectedRoute,getAdminStateList)
            route.get('/state-details/:id',protectedRoute,stateDetails);
            route.post("/store-state",protectedRoute,validateRequest(statusStoreSchema),storeState);
            route.post("/update-state/:state_id",protectedRoute,validateRequest(statusStoreSchema),updateState);
            route.post("/delete-state",protectedRoute,validateRequest(deleteStateSchema),deleteState);
            route.get("/export-state",exportStateToExcel);
            route.post("/import-states",protectedRoute, upload.single("file"), importStatesFromExcel);
            
            //route for city module
            route.get('/delete-all-city',protectedRoute,deleteAllCity);
            route.get("/get-admin-city-list",protectedRoute,getAdminCityList)
            route.get("/city-action/:city_id",protectedRoute,cityAction)
            route.get("/get-top-city",protectedRoute,getTopCity)
            route.post("/store-city",protectedRoute,validateRequest(cityStoreSchema),storeCity);
            route.post("/update-city/:city_id",protectedRoute,validateRequest(cityStoreSchema),updateCity);
            route.post("/delete-city",protectedRoute,validateRequest(deleteCitySchema),deleteCity);
            route.get("/export-city",exportCityToExcel);
            route.post("/import-city",protectedRoute, upload.single("file"), importCityFromExcel);
            route.get('/city-details/:id',protectedRoute,cityDetails);

            route.get("/user-action-activity-list",superadminRoute,userActionActivityList);
            
            //route for area module
            route.get('/delete-all-area',protectedRoute,deleteAllArea);
            route.get("/get-admin-area-list",protectedRoute,getAdminAreaList)
            route.post("/store-area",protectedRoute,validateRequest(areaStoreSchema),storeArea);
            route.post("/update-area/:area_id",protectedRoute,validateRequest(areaStoreSchema),updateArea);
            route.post("/delete-area",protectedRoute,validateRequest(deleteAreaSchema),deleteArea);
            route.get("/export-area",exportAreaToExcel);
            route.post("/import-area",protectedRoute, upload.single("file"), importAreaFromExcel);
            route.get('/area-details/:id',protectedRoute,areaDetails);

            // Faq 
            route.get("/get-faq-list",protectedRoute,getFaqList);
            route.post("/store-faq",protectedRoute,validateRequest(faqStoreSchema),storeFaq);
            route.post("/update-faq",protectedRoute,validateRequest(faqUpdateSchema),updateFaq);
            route.post("/delete-faq",protectedRoute,validateRequest(faqDeleteSchema),deleteFaq);
            route.get('/faq-details/:id',protectedRoute,faqDetails);
            // get faq frontend
            route.get("/get-faq",getFaqList); 

        } catch (error) {
            // Log any errors that occur during route definition
            console.log(error, 'warn')
        }
    }
