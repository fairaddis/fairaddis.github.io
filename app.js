// ===========================
// FairAddis - Enhanced Main Application Script
// ===========================

class FairAddis {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.businesses = [];
        this.filteredBusinesses = [];
        this.currentPage = 1;
        this.itemsPerPage = 6; // Increased for better SEO content density
        this.isLoggedIn = false;
        this.analyticsInitialized = false;
        
        this.init();
    }

    // ===========================
    // Enhanced Google Analytics Tracking
    // ===========================
    
    initAnalytics() {
        if (this.analyticsInitialized) return;
        
        console.log('Initializing Enhanced Analytics Tracking');
        this.analyticsInitialized = true;
        
        // Track initial page load
        this.trackPageView('Homepage');
        
        // Setup engagement tracking
        this.trackUserEngagement();
        
        // Setup form tracking
        this.setupContactFormTracking();
        this.setupAuthFormTracking();
        
        // Track initial load performance
        this.trackPerformanceMetrics();
    }

    trackPageView(pageName) {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-QHH2T5R808', {
                'page_title': pageName,
                'page_location': window.location.href,
                'page_path': window.location.pathname + window.location.hash
            });
        }
        this.trackEvent('page_view', 'navigation', pageName);
    }

    trackEvent(action, category, label, value = null) {
        try {
            if (typeof gtag !== 'undefined') {
                const eventParams = {
                    'event_category': category,
                    'event_label': label,
                    'non_interaction': false
                };
                
                if (value !== null) {
                    eventParams['value'] = value;
                }
                
                gtag('event', action, eventParams);
            }
            console.log(`📊 Analytics Event: ${action} - ${category} - ${label}`, value ? `Value: ${value}` : '');
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    trackUserEngagement() {
        let startTime = Date.now();
        let maxScroll = 0;
        let interactionCount = 0;

        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.trackEvent('time_spent', 'engagement', 'Page engagement', Math.round(timeSpent / 1000));
            this.trackEvent('user_interactions', 'engagement', 'Total interactions', interactionCount);
        });

        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollDepth > maxScroll) {
                maxScroll = scrollDepth;
                if ([25, 50, 75, 90, 100].includes(scrollDepth)) {
                    this.trackEvent('scroll_depth', 'engagement', `Scrolled ${scrollDepth}%`);
                }
            }
        });

        document.addEventListener('click', () => {
            interactionCount++;
        });
    }

    trackPerformanceMetrics() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
                        this.trackEvent('page_load_time', 'performance', 'Page load complete', Math.round(loadTime));
                    }
                }, 0);
            });
        }
    }

    // ===========================
    // Initialization
    // ===========================
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadBusinesses();
        this.updateFavoritesCount();
        this.setupCustomCursor();
        this.setupSearch();
        this.setupFilters();
        this.initAnalytics();
    }

    // ===========================
    // Theme Management
    // ===========================
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
        this.trackEvent('theme_loaded', 'preferences', `Theme: ${this.currentTheme}`);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
        this.trackEvent('theme_changed', 'preferences', `Theme: ${this.currentTheme}`);
    }

    updateThemeIcon() {
        const toggleBtn = document.getElementById('darkModeToggle');
        const icon = toggleBtn.querySelector('i');
        icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        toggleBtn.setAttribute('aria-pressed', this.currentTheme === 'dark');
    }

    // ===========================
    // Business Data & Management
    // ===========================
    async loadBusinesses() {
        try {
            console.log('Loading businesses from JSON...');
            const response = await fetch('businesses.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Successfully loaded businesses:', data.length);
            
            // Enhanced data processing for SEO
            this.businesses = this.processBusinessData(data);
            this.filteredBusinesses = [...this.businesses];
            
            this.renderBusinesses();
            this.populateFilterOptions();
            
            // Track data load success with business statistics
            const categories = [...new Set(this.businesses.map(b => b.category))];
            const areas = [...new Set(this.businesses.map(b => b.area))];
            
            this.trackEvent('business_data_loaded', 'data_loading', 
                `Businesses: ${data.length}, Categories: ${categories.length}, Areas: ${areas.length}`, 
                data.length
            );
            
        } catch (error) {
            console.error('Error loading businesses:', error);
            this.showNotification('የንግዶች ውሂብ መጫን አልተሳካም። እባክዎ እንደገና ይሞክሩ።', 'error');
            this.trackEvent('business_data_error', 'data_loading', 'Failed to load businesses', 0);
            
            // Fallback to empty array
            this.businesses = [];
            this.filteredBusinesses = [];
            this.renderBusinesses();
        }
    }

    processBusinessData(businesses) {
        return businesses.map(business => {
            // Ensure all businesses have required properties for SEO
            return {
                id: business.id || Math.random().toString(36).substr(2, 9),
                name: business.name || 'Unknown Business',
                category: business.category || 'other',
                area: business.area || 'Unknown Area',
                description: business.description || '',
                image: business.image || '/images/placeholder-business.jpg',
                rating: business.rating || 0,
                price: business.price || 'medium',
                isOpen: business.isOpen !== undefined ? business.isOpen : true,
                phone: business.phone || '',
                address: business.address || '',
                services: business.services || [],
                testimony: business.testimony || '',
                // Additional SEO properties
                images: business.images || [business.image],
                whatsapp: business.whatsapp || business.phone,
                email: business.email || '',
                mapLink: business.mapLink || `https://maps.google.com/?q=${encodeURIComponent(business.address)}`,
                testimonials: business.testimonials || [],
                badge: business.badge || ''
            };
        });
    }

    // ===========================
    // Custom Cursor
    // ===========================
    setupCustomCursor() {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorRing = document.querySelector('.cursor-ring');
        
        if (!cursorDot || !cursorRing) return;

        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorRing.style.left = e.clientX + 'px';
                cursorRing.style.top = e.clientY + 'px';
            }, 100);
        });

        const interactiveElements = document.querySelectorAll('button, a, input, select, .business-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursorDot.style.transform = 'scale(1.5)';
                cursorRing.style.transform = 'scale(1.2)';
            });

            element.addEventListener('mouseleave', () => {
                cursorDot.style.transform = 'scale(1)';
                cursorRing.style.transform = 'scale(1)';
            });
        });
    }

    // ===========================
    // Search Functionality
    // ===========================
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        searchInput.addEventListener('input', (e) => {
            this.debouncedSearch(e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });

        searchInput.addEventListener('focus', () => {
            this.trackEvent('search_focus', 'search_activity', 'Search input focused');
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch(searchInput.value);
        });
    }

    debouncedSearch = this.debounce((query) => {
        this.performSearch(query);
    }, 300);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    performSearch(query) {
        const originalLength = this.filteredBusinesses.length;
        
        if (!query.trim()) {
            this.filteredBusinesses = [...this.businesses];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredBusinesses = this.businesses.filter(business => 
                business.name.toLowerCase().includes(lowerQuery) ||
                (business.description && business.description.toLowerCase().includes(lowerQuery)) ||
                business.category.toLowerCase().includes(lowerQuery) ||
                business.area.toLowerCase().includes(lowerQuery) ||
                (business.services && business.services.some(service => 
                    service.toLowerCase().includes(lowerQuery)
                ))
            );
        }
        
        const resultsCount = this.filteredBusinesses.length;
        
        // Track search analytics
        this.trackEvent('search_performed', 'search_activity', query, resultsCount);
        
        if (resultsCount === 0 && query.trim()) {
            this.trackEvent('search_no_results', 'search_activity', query);
        } else if (resultsCount > 0) {
            this.trackEvent('search_with_results', 'search_activity', query, resultsCount);
        }
        
        this.currentPage = 1;
        this.renderBusinesses();
        this.updateResultsCount();
    }

    // ===========================
    // Filters
    // ===========================
    setupFilters() {
        const applyBtn = document.getElementById('applyFiltersBtn');
        const resetBtn = document.getElementById('resetFiltersBtn');

        applyBtn.addEventListener('click', () => this.applyFilters());
        resetBtn.addEventListener('click', () => this.resetFilters());

        this.syncFilters();
    }

    syncFilters() {
        const mainFilters = ['categoryFilterTop', 'areaFilterTop', 'priceFilter', 'openNowFilter'];
        const quickFilters = ['categoryFilter', 'areaFilter', 'sortFilter'];

        mainFilters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });

        quickFilters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.applyQuickFilters());
            }
        });
    }

    applyFilters() {
        const category = document.getElementById('categoryFilterTop').value;
        const area = document.getElementById('areaFilterTop').value;
        const price = document.getElementById('priceFilter').value;
        const openNow = document.getElementById('openNowFilter').value;
        const sort = document.getElementById('sortFilter').value;

        // Track filter application
        this.trackEvent('apply_filter', 'filter_usage', 
            `Category: ${category}, Area: ${area}, Price: ${price}, Open: ${openNow}, Sort: ${sort}`
        );
        
        if (category) this.trackEvent('filter_by_category', 'filter_usage', category);
        if (area) this.trackEvent('filter_by_area', 'filter_usage', area);
        if (price) this.trackEvent('filter_by_price', 'filter_usage', price);
        if (openNow) this.trackEvent('filter_by_open_status', 'filter_usage', openNow);
        if (sort) this.trackEvent('sort_by', 'filter_usage', sort);

        this.filteredBusinesses = this.businesses.filter(business => {
            const categoryMatch = !category || business.category === category;
            const areaMatch = !area || business.area === area;
            const priceMatch = !price || business.price === price;
            const openMatch = !openNow || 
                (openNow === 'open' && business.isOpen) || 
                (openNow === 'closed' && !business.isOpen);
            
            return categoryMatch && areaMatch && priceMatch && openMatch;
        });

        this.sortBusinesses(sort);
        this.currentPage = 1;
        this.renderBusinesses();
        this.updateResultsCount();
        
        // Track filter results
        this.trackEvent('filter_results', 'filter_usage', 'Businesses found', this.filteredBusinesses.length);
    }

    applyQuickFilters() {
        const category = document.getElementById('categoryFilter').value;
        const area = document.getElementById('areaFilter').value;
        const sort = document.getElementById('sortFilter').value;

        document.getElementById('categoryFilterTop').value = category;
        document.getElementById('areaFilterTop').value = area;

        this.applyFilters();
    }

    resetFilters() {
        document.getElementById('categoryFilterTop').value = '';
        document.getElementById('areaFilterTop').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('openNowFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('areaFilter').value = '';
        document.getElementById('sortFilter').value = 'name';

        this.filteredBusinesses = [...this.businesses];
        this.currentPage = 1;
        this.renderBusinesses();
        this.updateResultsCount();
        
        this.trackEvent('filters_reset', 'filter_usage', 'All filters reset');
    }

    sortBusinesses(sortBy) {
        switch (sortBy) {
            case 'rating':
                this.filteredBusinesses.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
            default:
                this.filteredBusinesses.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }

    populateFilterOptions() {
        const categories = [...new Set(this.businesses.map(b => b.category))];
        const areas = [...new Set(this.businesses.map(b => b.area))];

        this.populateSelect('categoryFilterTop', categories);
        this.populateSelect('areaFilterTop', areas);
        this.populateSelect('categoryFilter', categories);
        this.populateSelect('areaFilter', areas);
        
        this.trackEvent('filter_options_loaded', 'data_loading', 
            `Categories: ${categories.length}, Areas: ${areas.length}`
        );
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const firstOption = select.options[0];
        select.innerHTML = '';
        if (firstOption) select.appendChild(firstOption);

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = this.formatOptionText(option);
            select.appendChild(optionElement);
        });
    }

    formatOptionText(text) {
        const formatMap = {
            'megeb bet': 'ምግብ ቤቶች',
            'segur bet': 'የፀጉር አስተካካዮች',
            'juice bet': 'ጁስ ቤቶች',
            'mini super markets': 'ሚኒ ማርኬቶች',
            'ye setoche ye webet salon': 'የሴቶች ሳሎን',
            'sega bet': 'ሥጋ ቤቶች',
            'ቦሌ': 'ቦሌ',
            'ፒያሳ': 'ፒያሳ',
            'ሰማንያ': 'ሰማንያ',
            'ሳሪስ': 'ሳሪስ',
            'ጎተራ': 'ጎተራ',
            'ስታዲየም': 'ስታዲየም',
            'ቄር': 'ቄር',
            'ካሊቲ': 'ካሊቲ',
            'ጄሞ': 'ጄሞ'
        };
        
        return formatMap[text] || text;
    }

    // ===========================
    // Business Rendering with SEO Optimization
    // ===========================
    renderBusinesses() {
        const grid = document.getElementById('businessesGrid');
        if (!grid) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const businessesToShow = this.filteredBusinesses.slice(startIndex, endIndex);

        grid.innerHTML = '';

        if (businessesToShow.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3>ምንም ንግዶች አልተገኙም</h3>
                    <p>የፍለጋ ውጤትዎን ለማሳጠር ፍለጋዎን ወይም ማጣሪያዎችዎን ይለውጡ</p>
                </div>
            `;
            return;
        }

        businessesToShow.forEach((business, index) => {
            const card = this.createBusinessCard(business);
            grid.appendChild(card);
            
            // Lazy load tracking
            setTimeout(() => {
                if (card.isConnected) {
                    this.trackEvent('business_card_impression', 'impression', business.name, index + 1);
                }
            }, index * 100);
        });

        this.renderPagination();
        this.updateResultsCount();
        
        this.trackEvent('businesses_rendered', 'rendering', 
            `Page ${this.currentPage}`, businessesToShow.length
        );
    }

    createBusinessCard(business) {
        const template = document.getElementById('businessCardTemplate');
        const clone = template.content.cloneNode(true);
        
        const card = clone.querySelector('.business-card');
        const image = clone.querySelector('.card-image');
        const badge = clone.querySelector('.badge');
        const name = clone.querySelector('.business-name');
        const category = clone.querySelector('.category-tag');
        const area = clone.querySelector('.area-text');
        const rating = clone.querySelector('.rating-value');
        const description = clone.querySelector('.short-description');
        const viewBtn = clone.querySelector('.view-btn');
        const contactBtn = clone.querySelector('.contact-btn');
        const favoriteBtn = clone.querySelector('.favorite-btn');

        // Set content with SEO optimization
        image.src = business.image;
        image.alt = `${business.name} - ${this.formatOptionText(business.category)} in ${business.area}`;
        image.loading = "lazy";
        
        badge.textContent = business.badge || (business.isOpen ? 'ክፈት' : 'ዝጋ');
        badge.style.background = business.isOpen ? 'var(--success-color, #10b981)' : 'var(--accent-color, #ef4444)';
        badge.style.display = business.badge || business.isOpen !== undefined ? 'block' : 'none';
        
        name.textContent = business.name;
        category.textContent = this.formatOptionText(business.category);
        area.textContent = business.area;
        rating.textContent = business.rating?.toFixed(1) || '0.0';
        description.textContent = business.description || business.testimony || 'ከፍተኛ ጥራት ያለው ንግድ';

        // Set event listeners with tracking
        viewBtn.addEventListener('click', () => this.openBusinessProfile(business));
        
        if (business.phone) {
            contactBtn.href = `tel:${business.phone}`;
            contactBtn.addEventListener('click', () => 
                this.trackEvent('business_card_phone_click', 'contact_method', business.name)
            );
        } else {
            contactBtn.style.display = 'none';
        }
        
        favoriteBtn.addEventListener('click', () => this.toggleFavorite(business, favoriteBtn));
        favoriteBtn.setAttribute('aria-pressed', this.isFavorite(business.id));
        favoriteBtn.style.background = this.isFavorite(business.id) ? 
            'var(--accent-color)' : 'var(--bg-secondary)';
        favoriteBtn.style.color = this.isFavorite(business.id) ? 'white' : 'var(--text-light)';

        // Add schema.org structured data for SEO
        card.setAttribute('itemscope', '');
        card.setAttribute('itemtype', 'https://schema.org/LocalBusiness');
        name.setAttribute('itemprop', 'name');
        category.setAttribute('itemprop', 'category');
        description.setAttribute('itemprop', 'description');
        image.setAttribute('itemprop', 'image');

        return card;
    }

    // ===========================
    // Business Profile with Enhanced Tracking
    // ===========================
    openBusinessProfile(business) {
        // Track business view with detailed information
        this.trackEvent('view_business', 'business_interaction', business.name);
        this.trackEvent('view_business_category', 'business_category', business.category);
        this.trackEvent('view_business_area', 'business_area', business.area);
        this.trackEvent('view_business_rating', 'business_rating', business.name, business.rating);
        
        if (this.isFavorite(business.id)) {
            this.trackEvent('view_business_from_favorites', 'business_interaction', business.name);
        }

        const modal = document.getElementById('profileModal');
        const title = document.getElementById('profileTitle');
        const mainImage = document.getElementById('profileMainImage');
        const thumbnails = document.getElementById('profileThumbnails');
        const address = document.querySelector('.profile-address');
        const services = document.querySelector('.profile-services');
        const callBtn = document.getElementById('profileCall');
        const whatsappBtn = document.getElementById('profileWhatsApp');
        const emailBtn = document.getElementById('profileEmail');
        const favoriteBtn = document.getElementById('profileFavoriteBtn');
        const directionsBtn = document.getElementById('getDirectionsBtn');
        const testimonials = document.getElementById('profileTestimonials');

        // Set content
        title.textContent = business.name;
        mainImage.src = business.images ? business.images[0] : business.image;
        mainImage.alt = `${business.name} - ${business.category} in ${business.area}`;
        address.textContent = `አድራሻ: ${business.address || 'አድራሻ አልተገኘም'}`;
        services.textContent = `አገልግሎቶች: ${business.services?.join(', ') || 'አገልግሎቶች አልተገኙም'}`;
        
        // Contact buttons with validation
        if (business.phone) {
            callBtn.href = `tel:${business.phone}`;
            callBtn.addEventListener('click', () => this.trackEvent('phone_call', 'contact_method', business.name));
        } else {
            callBtn.style.display = 'none';
        }

        if (business.whatsapp) {
            whatsappBtn.href = `https://wa.me/${business.whatsapp.replace('+', '')}`;
            whatsappBtn.addEventListener('click', () => this.trackEvent('whatsapp_click', 'contact_method', business.name));
        } else {
            whatsappBtn.style.display = 'none';
        }

        if (business.email) {
            emailBtn.href = `mailto:${business.email}`;
            emailBtn.addEventListener('click', () => this.trackEvent('email_click', 'contact_method', business.name));
        } else {
            emailBtn.style.display = 'none';
        }

        // Thumbnails gallery
        thumbnails.innerHTML = '';
        const images = business.images || [business.image];
        images.forEach((image, index) => {
            const thumb = document.createElement('img');
            thumb.src = image;
            thumb.alt = `${business.name} - Image ${index + 1}`;
            thumb.loading = "lazy";
            thumb.addEventListener('click', () => {
                mainImage.src = image;
                this.trackEvent('view_business_image', 'business_gallery', business.name, index + 1);
            });
            thumbnails.appendChild(thumb);
        });

        // Favorite button
        const isFav = this.isFavorite(business.id);
        favoriteBtn.innerHTML = isFav ? 
            '<i class="fas fa-heart"></i> ከተወዳጆች አስወግድ' : 
            '<i class="fas fa-heart"></i> ተወዳጅ ያድርጉ';
        
        favoriteBtn.addEventListener('click', () => {
            this.toggleFavorite(business, favoriteBtn);
            favoriteBtn.innerHTML = this.isFavorite(business.id) ? 
                '<i class="fas fa-heart"></i> ከተወዳጆች አስወግድ' : 
                '<i class="fas fa-heart"></i> ተወዳጅ ያድርጉ';
        });

        // Directions button
        if (business.mapLink) {
            directionsBtn.href = business.mapLink;
            directionsBtn.addEventListener('click', () => this.trackEvent('get_directions', 'business_interaction', business.name));
        } else {
            directionsBtn.style.display = 'none';
        }

        // Testimonials
        testimonials.innerHTML = '<h3>አስተያየቶች</h3>';
        if (business.testimonials && business.testimonials.length > 0) {
            business.testimonials.forEach(testimonial => {
                const testimonialElement = document.createElement('div');
                testimonialElement.className = 'testimonial';
                testimonialElement.innerHTML = `
                    <div class="testimonial-header">
                        <strong>${testimonial.name}</strong>
                        <span class="rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</span>
                    </div>
                    <p>${testimonial.comment}</p>
                `;
                testimonials.appendChild(testimonialElement);
            });
        } else {
            testimonials.innerHTML += `<p>${business.testimony || 'አስተያየቶች አልተገኙም'}</p>`;
        }

        this.openModal('profileModal');
    }

    // ===========================
    // Favorites Management
    // ===========================
    toggleFavorite(business, button) {
        const isCurrentlyFavorite = this.isFavorite(business.id);
        const action = isCurrentlyFavorite ? 'remove_favorite' : 'add_favorite';
        
        // Track favorite actions
        this.trackEvent(action, 'favorites', business.name);
        this.trackEvent(action + '_category', 'favorites_category', business.category);
        this.trackEvent(action + '_area', 'favorites_area', business.area);
        
        if (isCurrentlyFavorite) {
            this.removeFavorite(business.id);
            button.setAttribute('aria-pressed', 'false');
            button.style.background = 'var(--bg-secondary)';
            button.style.color = 'var(--text-light)';
        } else {
            this.addFavorite(business);
            button.setAttribute('aria-pressed', 'true');
            button.style.background = 'var(--accent-color)';
            button.style.color = 'white';
        }
        
        this.updateFavoritesCount();
        
        // Show notification
        this.showNotification(isCurrentlyFavorite ? 'ከተወዳጆች ተሰርዟል' : 'ወደ ተወዳጆች ታክሏል');
        
        // Track favorites count
        this.trackEvent('favorites_count_updated', 'favorites', 'Total favorites', this.favorites.length);
    }

    isFavorite(businessId) {
        return this.favorites.some(fav => fav.id === businessId);
    }

    addFavorite(business) {
        if (!this.isFavorite(business.id)) {
            this.favorites.push(business);
            this.saveFavorites();
        }
    }

    removeFavorite(businessId) {
        this.favorites = this.favorites.filter(fav => fav.id !== businessId);
        this.saveFavorites();
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    updateFavoritesCount() {
        const countElement = document.getElementById('favoritesCount');
        if (countElement) {
            countElement.textContent = this.favorites.length;
            countElement.style.display = this.favorites.length > 0 ? 'flex' : 'none';
        }
    }

    // ===========================
    // Pagination
    // ===========================
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredBusinesses.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="pagination-prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="pagination-page ${i === this.currentPage ? 'active' : ''}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        // Next button
        paginationHTML += `
            <button class="pagination-next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;

        // Add event listeners
        pagination.querySelector('.pagination-prev')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderBusinesses();
                this.trackEvent('pagination_previous', 'pagination', `Page ${this.currentPage}`);
            }
        });

        pagination.querySelector('.pagination-next')?.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderBusinesses();
                this.trackEvent('pagination_next', 'pagination', `Page ${this.currentPage}`);
            }
        });

        pagination.querySelectorAll('.pagination-page').forEach((btn) => {
            btn.addEventListener('click', () => {
                const pageNumber = parseInt(btn.textContent);
                this.currentPage = pageNumber;
                this.renderBusinesses();
                this.trackEvent('pagination_click', 'pagination', `Page ${pageNumber}`);
            });
        });
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = `${this.filteredBusinesses.length} ንግዶች ተገኝተዋል`;
        }
    }

    // ===========================
    // Modals Management
    // ===========================
    openFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        const list = document.getElementById('favoritesList');

        list.innerHTML = '';

        if (this.favorites.length === 0) {
            list.innerHTML = `
                <div class="no-favorites" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-heart" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3>ምንም ተወዳጅ ንግዶች የሉም</h3>
                    <p>ንግዶችን በልብ ምልክት በማድረግ እዚህ ያስቀምጡ</p>
                </div>
            `;
        } else {
            this.favorites.forEach(business => {
                const favItem = document.createElement('div');
                favItem.className = 'favorite-item';
                favItem.style.cssText = `
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    padding: 1rem; 
                    border-bottom: 1px solid var(--border-color);
                `;
                
                favItem.innerHTML = `
                    <img src="${business.image}" alt="${business.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.5rem 0;">${business.name}</h4>
                        <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">${business.area} - ${this.formatOptionText(business.category)}</p>
                    </div>
                    <button class="btn-outline remove-favorite" data-id="${business.id}" style="padding: 0.5rem 1rem;">አስወግድ</button>
                `;

                list.appendChild(favItem);
            });

            // Add event listeners to remove buttons
            list.querySelectorAll('.remove-favorite').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const businessId = e.target.getAttribute('data-id');
                    this.removeFavorite(businessId);
                    this.updateFavoritesCount();
                    this.openFavoritesModal();
                    this.renderBusinesses();
                    this.showNotification('ከተወዳጆች ተሰርዟል');
                });
            });
        }

        this.openModal('favoritesModal');
        this.trackEvent('favorites_modal_opened', 'modal_interaction', 'Favorites modal', this.favorites.length);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
            }
        });

        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalId);
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        this.trackEvent('modal_closed', 'modal_interaction', modalId);
    }

    // ===========================
    // Form Tracking
    // ===========================
    setupContactFormTracking() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                const formData = new FormData(contactForm);
                const name = formData.get('name') || 'Unknown';
                
                this.trackEvent('contact_form_submit', 'contact', 'Contact form submitted');
                this.trackEvent('contact_form_submission', 'lead_generation', `Form submitted by ${name}`);
                
                setTimeout(() => {
                    this.trackEvent('contact_form_success', 'conversion', 'Form submission successful');
                }, 1000);
            });

            const formFields = contactForm.querySelectorAll('input, textarea');
            formFields.forEach(field => {
                field.addEventListener('focus', () => {
                    this.trackEvent('contact_form_field_focus', 'form_interaction', field.name);
                });
                
                field.addEventListener('blur', () => {
                    if (field.value.trim()) {
                        this.trackEvent('contact_form_field_completed', 'form_interaction', field.name);
                    }
                });
            });
        }
    }

    setupAuthFormTracking() {
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                this.trackEvent('auth_form_submit', 'authentication', 'Login/Register form submitted');
            });

            const socialButtons = document.querySelectorAll('.social-btn');
            socialButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const platform = button.classList.contains('google') ? 'Google' : 'Facebook';
                    this.trackEvent('social_login_attempt', 'authentication', platform);
                });
            });
        }
    }

    // ===========================
    // Authentication
    // ===========================
    setupAuth() {
        const loginForm = document.getElementById('authForm');
        const registerBtn = document.getElementById('openRegisterBtn');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        registerBtn.addEventListener('click', () => {
            this.switchToRegister();
            this.trackEvent('auth_mode_switch', 'authentication', 'Switched to register mode');
        });
    }

    handleLogin() {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        if (email && password) {
            this.isLoggedIn = true;
            this.showNotification('በተሳካ ሁኔታ ገብተዋል!');
            this.closeModal('loginModal');
            document.getElementById('openLoginBtn').textContent = 'መለያ';
            
            this.trackEvent('login_success', 'authentication', 'User logged in successfully');
        } else {
            this.showNotification('እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ', 'error');
            this.trackEvent('login_failed', 'authentication', 'Login failed - missing fields');
        }
    }

    switchToRegister() {
        const authForm = document.getElementById('authForm');
        const submitBtn = authForm.querySelector('button[type="submit"]');
        const switchBtn = document.getElementById('openRegisterBtn');

        if (submitBtn.textContent === 'ግባ') {
            submitBtn.textContent = 'ተመዝገብ';
            switchBtn.textContent = 'ግባ';
            authForm.querySelector('h2').textContent = 'ተመዝገብ';
        } else {
            submitBtn.textContent = 'ግባ';
            switchBtn.textContent = 'መመዝገብ';
            authForm.querySelector('h2').textContent = 'ግባ / ተመዝገብ';
        }
    }

    // ===========================
    // Event Listeners Setup
    // ===========================
    setupEventListeners() {
        // Theme toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleTheme());

        // Favorites modal
        document.getElementById('favoritesOpenBtn').addEventListener('click', () => this.openFavoritesModal());

        // Login modal
        document.getElementById('openLoginBtn').addEventListener('click', () => {
            this.openModal('loginModal');
            this.trackEvent('login_modal_opened', 'modal_interaction', 'Login modal');
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Track navigation
                    const section = targetId.substring(1) || 'home';
                    this.trackNavigation(section);
                }
            });
        });

        // Category links in footer
        document.querySelectorAll('[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                document.getElementById('categoryFilterTop').value = category;
                document.getElementById('categoryFilter').value = category;
                this.applyFilters();
                
                document.querySelector('.businesses-section').scrollIntoView({
                    behavior: 'smooth'
                });
                
                this.trackEvent('footer_category_click', 'navigation', category);
            });
        });

        // Track external link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                if (link.href.includes('tel:')) {
                    this.trackEvent('external_phone_call', 'external_link', 'Phone number clicked');
                } else if (link.href.includes('mailto:')) {
                    this.trackEvent('external_email_click', 'external_link', 'Email clicked');
                } else if (link.target === '_blank' || !link.href.includes(window.location.hostname)) {
                    this.trackEvent('external_link_click', 'external_link', link.href);
                }
            }
        });

        // Setup auth
        this.setupAuth();
    }

    trackNavigation(section) {
        this.trackEvent('navigation_click', 'navigation', section);
        this.trackPageView(section.charAt(0).toUpperCase() + section.slice(1));
    }

    // ===========================
    // Utility Functions
    // ===========================
    showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? 'var(--accent-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        this.trackEvent('notification_shown', 'ui_interaction', `${type} notification`);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// ===========================
// Animation Keyframes
// ===========================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .testimonial {
        background: var(--bg-secondary);
        padding: 1rem;
        border-radius: var(--radius);
        margin-bottom: 1rem;
    }
    
    .testimonial-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .testimonial .rating {
        color: #f39c12;
    }
    
    /* Enhanced cursor animations */
    .cursor-dot, .cursor-ring {
        transition: transform 0.15s ease;
    }
`;
document.head.appendChild(style);

// ===========================
// Initialize Application
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    window.fairAddis = new FairAddis();
    
    // Track DOM content loaded performance
    if ('performance' in window) {
        const domContentLoaded = performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd;
        window.fairAddis.trackEvent('dom_content_loaded', 'performance', 'DOM ready', Math.round(domContentLoaded));
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
                window.fairAddis.trackEvent('service_worker_registered', 'performance', 'Service worker installed');
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
                window.fairAddis.trackEvent('service_worker_failed', 'performance', 'Service worker installation failed');
            });
    });
}

// Error tracking
window.addEventListener('error', (e) => {
    if (window.fairAddis) {
        window.fairAddis.trackEvent('javascript_error', 'error_tracking', e.message, 1);
    }
});

// Page visibility tracking
document.addEventListener('visibilitychange', () => {
    if (window.fairAddis) {
        const visibility = document.visibilityState;
        window.fairAddis.trackEvent('page_visibility_change', 'engagement', `Page ${visibility}`);
    }
});