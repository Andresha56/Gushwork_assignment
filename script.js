
document.addEventListener("DOMContentLoaded", function () {
    //    STICKY BAR

    var stickyBar = document.getElementById("sticky-bar");
    var heroSection = document.getElementById("hero");
    var lastScrollY = 0;

    window.addEventListener(
        "scroll",
        function () {
            var y = window.scrollY;
            var heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            var scrollingDown = y > lastScrollY;

            if (y > heroBottom && scrollingDown) {
                stickyBar.classList.add("on");
                stickyBar.setAttribute("aria-hidden", "false");
            } else if (!scrollingDown) {
                stickyBar.classList.remove("on");
                stickyBar.setAttribute("aria-hidden", "true");
            }
            lastScrollY = y;
        },
        { passive: true }
    );

    // HAMBURGER MENU
    var menuToggle = document.getElementById("menu-toggle");
    var mobileMenu = document.getElementById("mobile-menu");

    menuToggle.addEventListener("click", function () {
        var isOpen = mobileMenu.classList.toggle("on");
        menuToggle.classList.toggle("on", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when any link inside it is clicked
    mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            mobileMenu.classList.remove("on");
            menuToggle.classList.remove("on");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    // HERO IMAGE GALLERY
    var galleryStage = document.querySelector(".gallery__stage");
    var galleryMain = document.getElementById("gallery-main");
    var galleryLens = document.getElementById("gallery-lens");
    var galleryZoom = document.getElementById("gallery-zoom");
    var galleryPrev = document.getElementById("gallery-prev");
    var galleryNext = document.getElementById("gallery-next");
    var slides = document.querySelectorAll(".gallery__slide");
    var thumbs = document.querySelectorAll(".gallery__thumb");
    var currentSlide = 0;
    var ZOOM_FACTOR = 2.5;

    function goToSlide(index) {
        slides[currentSlide].classList.remove("on");
        thumbs[currentSlide].classList.remove("on");
        thumbs[currentSlide].setAttribute("aria-pressed", "false");

        currentSlide =
            ((index % slides.length) + slides.length) % slides.length;

        slides[currentSlide].classList.add("on");
        thumbs[currentSlide].classList.add("on");
        thumbs[currentSlide].setAttribute("aria-pressed", "true");

        refreshZoomSource();
    }

    galleryPrev.addEventListener("click", function () {
        goToSlide(currentSlide - 1);
    });
    galleryNext.addEventListener("click", function () {
        goToSlide(currentSlide + 1);
    });

    thumbs.forEach(function (thumb) {
        thumb.addEventListener("click", function () {
            goToSlide(parseInt(thumb.getAttribute("data-idx"), 10));
        });
    });

    function getActiveImg() {
        return slides[currentSlide].querySelector("img");
    }

    function refreshZoomSource() {
        var img = getActiveImg();
        if (!img) return;
        if (img.complete && img.naturalWidth > 0) {
            galleryZoom.style.backgroundImage = "url('" + img.src + "')";
        } else {
            img.addEventListener(
                "load",
                function () {
                    galleryZoom.style.backgroundImage =
                        "url('" + img.src + "')";
                },
                { once: true }
            );
        }
    }
    refreshZoomSource();

    galleryMain.addEventListener("mousemove", function (e) {
        if (window.innerWidth <= 1300) return;

        var rect = galleryMain.getBoundingClientRect();
        var lensW = galleryLens.offsetWidth;
        var lensH = galleryLens.offsetHeight;
        var zoomW = galleryZoom.offsetWidth;
        var zoomH = galleryZoom.offsetHeight;

        // clamp lens centre to stay fully within the image
        var x = Math.max(
            lensW / 2,
            Math.min(e.clientX - rect.left, rect.width - lensW / 2)
        );
        var y = Math.max(
            lensH / 2,
            Math.min(e.clientY - rect.top, rect.height - lensH / 2)
        );

        galleryLens.style.left = x + "px";
        galleryLens.style.top = y + "px";

        var bgW = rect.width * ZOOM_FACTOR;
        var bgH = rect.height * ZOOM_FACTOR;
        var bgX = (x / rect.width) * bgW - zoomW / 2;
        var bgY = (y / rect.height) * bgH - zoomH / 2;

        galleryZoom.style.backgroundSize = bgW + "px " + bgH + "px";
        galleryZoom.style.backgroundPosition = "-" + bgX + "px -" + bgY + "px";

        // toggle "zoom-on" on the STAGE (parent of both main & zoom pane)
        galleryStage.classList.add("zoom-on");
        // also needed for the lens inside main
        galleryMain.classList.add("zoom-on");
    });

    galleryMain.addEventListener("mouseleave", function () {
        galleryStage.classList.remove("zoom-on");
        galleryMain.classList.remove("zoom-on");
    });

    // FAQ ACCORDION
    document.querySelectorAll(".faq-item").forEach(function (item) {
        item.querySelector(".faq-question").addEventListener(
            "click",
            function () {
                var alreadyOpen = item.classList.contains("on");

                // collapse all
                document
                    .querySelectorAll(".faq-item")
                    .forEach(function (other) {
                        other.classList.remove("on");
                        other
                            .querySelector(".faq-question")
                            .setAttribute("aria-expanded", "false");
                    });

                // if it was closed, open it
                if (!alreadyOpen) {
                    item.classList.add("on");
                    item.querySelector(".faq-question").setAttribute(
                        "aria-expanded",
                        "true"
                    );
                }
            }
        );
    });

    // MANUFACTURING TABS + MOBILE PREV/NEXT

    var mfgTabs = Array.from(document.querySelectorAll(".mfg-tab"));
    var mfgPanels = Array.from(document.querySelectorAll(".mfg-panel"));
    var stepBadge = document.getElementById("mfg-step-badge");
    var mfgPrevBtn = document.getElementById("mfg-prev");
    var mfgNextBtn = document.getElementById("mfg-next");
    var currentMfgIdx = 0;
    var TOTAL_TABS = mfgTabs.length;

    function activateMfgTab(idx) {
        // clamp
        idx = Math.max(0, Math.min(TOTAL_TABS - 1, idx));
        currentMfgIdx = idx;

        mfgTabs.forEach(function (t, i) {
            t.classList.toggle("on", i === idx);
            t.setAttribute("aria-selected", i === idx ? "true" : "false");
        });
        mfgPanels.forEach(function (p, i) {
            p.classList.toggle("on", i === idx);
        });

        // update step badge
        var label =
            mfgTabs[idx].getAttribute("data-label") || mfgTabs[idx].textContent;
        if (stepBadge)
            stepBadge.textContent =
                "Step " + (idx + 1) + "/" + TOTAL_TABS + ": " + label;

        // sync prev/next disabled state
        if (mfgPrevBtn) mfgPrevBtn.disabled = idx === 0;
        if (mfgNextBtn) mfgNextBtn.disabled = idx === TOTAL_TABS - 1;

        // scroll active tab into view on tablet
        mfgTabs[idx].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }

    mfgTabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () {
            activateMfgTab(i);
        });
    });

    if (mfgPrevBtn)
        mfgPrevBtn.addEventListener("click", function () {
            activateMfgTab(currentMfgIdx - 1);
        });
    if (mfgNextBtn)
        mfgNextBtn.addEventListener("click", function () {
            activateMfgTab(currentMfgIdx + 1);
        });

    activateMfgTab(0);

    // APPLICATIONS CAROUSEL

    var carTrack = document.getElementById("carousel-track");
    var carPrev = document.getElementById("carousel-prev");
    var carNext = document.getElementById("carousel-next");

    function scrollAmount() {
        var card = carTrack.querySelector(".carousel-card");
        return card ? card.offsetWidth + 16 : 280;
    }

    carNext.addEventListener("click", function () {
        carTrack.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });
    carPrev.addEventListener("click", function () {
        carTrack.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    function syncCarouselBtns() {
        var atStart = carTrack.scrollLeft <= 4;
        var atEnd =
            carTrack.scrollLeft + carTrack.offsetWidth >=
            carTrack.scrollWidth - 4;
        carPrev.style.opacity = atStart ? "0.35" : "1";
        carNext.style.opacity = atEnd ? "0.35" : "1";
    }
    carTrack.addEventListener("scroll", syncCarouselBtns, { passive: true });
    syncCarouselBtns();
});
