// Analytics Configuration
const APP_ANALYTICS = {
    // Google Analytics Configuration
    GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Replace with your GA measurement ID
    
    // Facebook Pixel Configuration 
    FB_PIXEL_ID: 'XXXXXXXXXX', // Replace with your Facebook Pixel ID

    // TikTok Pixel Configuration
    TIKTOK_PIXEL_ID: 'XXXXXXXXXX', // Replace with your TikTok Pixel ID

    // Performance monitoring
    PERFORMANCE_SAMPLING_RATE: 0.1, // Sample 10% of users for performance monitoring

    // Error tracking
    MAX_ERROR_LOGS: 10, // Maximum number of errors to log per session
    errorCount: 0,
    // Google Analytics Configuration
    GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Replace with your GA measurement ID
    
    // Facebook Pixel Configuration
    FB_PIXEL_ID: 'XXXXXXXXXX', // Replace with your Facebook Pixel ID

    // Initialize all analytics
    init: function() {
            this.initGoogleAnalytics();
            this.initFacebookPixel();
            this.initTikTokPixel();
            this.initPerformanceMonitoring();
            this.initErrorTracking();
            this.setupEventListeners();
    },

        // Initialize TikTok Pixel
        initTikTokPixel: function() {
            !function (w, d, t) {
                w.TiktokAnalyticsObject=t;
                var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i;
                var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load(this.TIKTOK_PIXEL_ID);
                ttq.page();
            }(window, document, 'ttq');
        },

        // Performance monitoring
        initPerformanceMonitoring: function() {
            if (Math.random() < this.PERFORMANCE_SAMPLING_RATE) {
                // Monitor navigation timing
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const timing = window.performance.timing;
                        const loadTime = timing.loadEventEnd - timing.navigationStart;
                        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                    
                        if (window.gtag) {
                            gtag('event', 'performance', {
                                load_time: loadTime,
                                dom_ready: domReady,
                                url: window.location.pathname
                            });
                        }
                    }, 0);
                });

                // Monitor resource timing
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.initiatorType === 'img' || entry.initiatorType === 'css') {
                            if (entry.duration > 1000) { // Log slow resources (>1s)
                                gtag('event', 'slow_resource', {
                                    resource_url: entry.name,
                                    load_time: entry.duration,
                                    resource_type: entry.initiatorType
                                });
                            }
                        }
                    }
                });
                observer.observe({ entryTypes: ['resource'] });
            }
        },

        // Error tracking
        initErrorTracking: function() {
            window.addEventListener('error', (event) => {
                if (this.errorCount < this.MAX_ERROR_LOGS) {
                    if (window.gtag) {
                        gtag('event', 'javascript_error', {
                            error_message: event.message,
                            error_url: event.filename,
                            error_line: event.lineno,
                            error_column: event.colno,
                            page_url: window.location.href
                        });
                    }
                    this.errorCount++;
                }
            });

            // Track failed API requests
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                try {
                    const response = await originalFetch(...args);
                    if (!response.ok && window.gtag) {
                        gtag('event', 'api_error', {
                            status: response.status,
                            url: args[0],
                            method: args[1]?.method || 'GET'
                        });
                    }
                    return response;
                } catch (error) {
                    if (window.gtag) {
                        gtag('event', 'api_error', {
                            error: error.message,
                            url: args[0]
                        });
                    }
                    throw error;
                }
            };
        },
    // Initialize Google Analytics
    initGoogleAnalytics: function() {
        // Google Analytics 4 initialization
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.GA_MEASUREMENT_ID);

        // Make gtag available globally
        window.gtag = gtag;
    },

    // Initialize Facebook Pixel
    initFacebookPixel: function() {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', this.FB_PIXEL_ID);
        fbq('track', 'PageView');
    },

    // Track page views
    trackPageView: function(pageTitle, path) {
        if (window.gtag) {
            gtag('event', 'page_view', {
                    page_title: pageTitle,
                    page_path: path,
                    page_referrer: document.referrer,
                    page_encoding: document.characterSet,
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                    page_load_time: window.performance && window.performance.timing ? 
                        window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : undefined
            });
        }
        if (window.fbq) {
            fbq('track', 'PageView');
        }
            if (window.ttq) {
                ttq.track('Browse');
            }
    },

        // Track product views
        trackProductView: function(product) {
            if (window.gtag) {
                gtag('event', 'view_item', {
                    currency: 'VND',
                    value: product.price,
                    items: [{
                        item_id: product.id,
                        item_name: product.name,
                        price: product.price,
                        currency: 'VND',
                        category: product.category,
                        quantity: 1
                    }]
                });
            }
            if (window.fbq) {
                fbq('track', 'ViewContent', {
                    content_type: 'product',
                    content_ids: [product.id],
                    content_name: product.name,
                    content_category: product.category,
                    value: product.price,
                    currency: 'VND'
                });
            }
            if (window.ttq) {
                ttq.track('ViewContent', {
                    content_type: 'product',
                    content_id: product.id,
                    content_name: product.name,
                    price: product.price,
                    currency: 'VND'
                });
            }
        },

        // Track add to cart
        trackAddToCart: function(product) {
            if (window.gtag) {
                gtag('event', 'add_to_cart', {
                    currency: 'VND',
                    value: product.price,
                    items: [{
                        item_id: product.id,
                        item_name: product.name,
                        price: product.price,
                        currency: 'VND',
                        category: product.category,
                        quantity: product.quantity || 1
                    }]
                });
            }
            if (window.fbq) {
                fbq('track', 'AddToCart', {
                    content_type: 'product',
                    content_ids: [product.id],
                    content_name: product.name,
                    content_category: product.category,
                    value: product.price,
                    currency: 'VND',
                    contents: [{
                        id: product.id,
                        quantity: product.quantity || 1
                    }]
                });
            }
            if (window.ttq) {
                ttq.track('AddToCart', {
                    content_type: 'product',
                    content_id: product.id,
                    content_name: product.name,
                    quantity: product.quantity || 1,
                    price: product.price,
                    currency: 'VND'
                });
            }
        },

        // Track purchase
        trackPurchase: function(order) {
            if (window.gtag) {
                gtag('event', 'purchase', {
                    transaction_id: order.id,
                    value: order.total,
                    tax: order.tax,
                    shipping: order.shipping,
                    currency: 'VND',
                    items: order.items.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        currency: 'VND',
                        category: item.category,
                        quantity: item.quantity
                    }))
                });
            }
            if (window.fbq) {
                fbq('track', 'Purchase', {
                    content_type: 'product',
                    content_ids: order.items.map(item => item.id),
                    contents: order.items.map(item => ({
                        id: item.id,
                        quantity: item.quantity
                    })),
                    value: order.total,
                    currency: 'VND',
                    num_items: order.items.length
                });
            }
            if (window.ttq) {
                ttq.track('Purchase', {
                    contents: order.items.map(item => ({
                        content_type: 'product',
                        content_id: item.id,
                        content_name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    value: order.total,
                    currency: 'VND'
                });
            }
        },
    // Track product views
    trackProductView: function(product) {
        if (window.gtag) {
            gtag('event', 'view_item', {
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                    currency: 'VND'
                }]
            });
        }
        if (window.fbq) {
            fbq('track', 'ViewContent', {
                content_type: 'product',
                content_ids: [product.id],
                content_name: product.name,
                value: product.price,
                currency: 'VND'
            });
        }
    },

    // Track add to cart events
    trackAddToCart: function(product) {
        if (window.gtag) {
            gtag('event', 'add_to_cart', {
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                    currency: 'VND'
                }]
            });
        }
        if (window.fbq) {
            fbq('track', 'AddToCart', {
                content_type: 'product',
                content_ids: [product.id],
                content_name: product.name,
                value: product.price * product.quantity,
                currency: 'VND'
            });
        }
    },

    // Track purchase events
    trackPurchase: function(order) {
        if (window.gtag) {
            gtag('event', 'purchase', {
                transaction_id: order.id,
                value: order.total,
                currency: 'VND',
                items: order.items.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            });
        }
        if (window.fbq) {
            fbq('track', 'Purchase', {
                content_type: 'product_group',
                content_ids: order.items.map(item => item.id),
                value: order.total,
                currency: 'VND',
                num_items: order.items.length
            });
        }
    },

    // Track user registration
    trackSignUp: function(method) {
        if (window.gtag) {
            gtag('event', 'sign_up', {
                method: method
            });
        }
        if (window.fbq) {
            fbq('track', 'CompleteRegistration', {
                status: true,
                method: method
            });
        }
    },

    // Track user login
    trackLogin: function(method) {
        if (window.gtag) {
            gtag('event', 'login', {
                method: method
            });
        }
        if (window.fbq) {
            fbq('track', 'Login', {
                status: true,
                method: method
            });
        }
    },

    // Track search events
    trackSearch: function(searchTerm) {
        if (window.gtag) {
            gtag('event', 'search', {
                search_term: searchTerm
            });
        }
        if (window.fbq) {
            fbq('track', 'Search', {
                search_string: searchTerm
            });
        }
    },

    // Track wishlist events
    trackAddToWishlist: function(product) {
        if (window.gtag) {
            gtag('event', 'add_to_wishlist', {
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                    currency: 'VND'
                }]
            });
        }
        if (window.fbq) {
            fbq('track', 'AddToWishlist', {
                content_type: 'product',
                content_ids: [product.id],
                content_name: product.name,
                value: product.price,
                currency: 'VND'
            });
        }
    },

    // Set up event listeners for common interactions
    setupEventListeners: function() {
            // Track all outbound links
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.hostname !== window.location.hostname) {
                    if (window.gtag) {
                        gtag('event', 'click', {
                            event_category: 'outbound',
                            event_label: link.href
                        });
                    }
                }
            });

            // Track form submissions
            document.addEventListener('submit', (e) => {
                const form = e.target;
                if (window.gtag) {
                    gtag('event', 'form_submit', {
                        event_category: 'form',
                        event_label: form.id || form.action
                    });
                }
            });

            // Track scroll depth
            let maxScroll = 0;
            let timer = null;
            window.addEventListener('scroll', () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    const scrollPercent = Math.round((window.scrollY + window.innerHeight) / 
                        document.documentElement.scrollHeight * 100);
                    if (scrollPercent > maxScroll) {
                        maxScroll = scrollPercent;
                        if (window.gtag && (scrollPercent === 25 || scrollPercent === 50 || 
                            scrollPercent === 75 || scrollPercent === 100)) {
                            gtag('event', 'scroll_depth', {
                                percent: scrollPercent,
                                page_url: window.location.pathname
                            });
                        }
                    }
                }, 100);
            });

            // Track user engagement time
            let engagementTime = 0;
            let engagementTimer = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    engagementTime += 10;
                    if (engagementTime % 30 === 0) { // Log every 30 seconds
                        if (window.gtag) {
                            gtag('event', 'engagement_time', {
                                seconds: engagementTime,
                                page_url: window.location.pathname
                            });
                        }
                    }
                }
            }, 10000);

            // Track search interactions
            const searchForms = document.querySelectorAll('form[role="search"]');
            searchForms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const searchInput = form.querySelector('input[type="search"]');
                    if (searchInput && window.gtag) {
                        gtag('event', 'search', {
                            search_term: searchInput.value
                        });
                    }
                });
            });

            // Track add to cart buttons
            document.addEventListener('click', (e) => {
                const addToCartBtn = e.target.closest('.add-to-cart-button');
                if (addToCartBtn) {
                    const productData = JSON.parse(addToCartBtn.dataset.product || '{}');
                    if (Object.keys(productData).length) {
                        this.trackAddToCart(productData);
                    }
                }
            });

            // Track product clicks
            document.addEventListener('click', (e) => {
                const productLink = e.target.closest('.product-link');
                if (productLink) {
                    const productData = JSON.parse(productLink.dataset.product || '{}');
                    if (Object.keys(productData).length && window.gtag) {
                        gtag('event', 'select_item', {
                            items: [{
                                item_id: productData.id,
                                item_name: productData.name,
                                price: productData.price,
                                currency: 'VND',
                                category: productData.category
                            }]
                        });
                    }
                }
            });

            // Cleanup timer on page unload
            window.addEventListener('unload', () => {
                clearInterval(engagementTimer);
            });
    }
};
    // Initialize analytics when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        APP_ANALYTICS.init();
    });

// Auto-initialize analytics when the script loads
document.addEventListener('DOMContentLoaded', () => {
    APP_ANALYTICS.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_ANALYTICS;
}