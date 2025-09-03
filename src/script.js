/**
@license MIT
@author Starexx
*/
let iconsData = [];
let filteredData = [];
let currentPage = 0;
const itemsPerPage = 100;
let uniqueFilters = {
    itemType: new Set(),
    Rare: new Set(),
    collectionType: new Set()
};
let lastClickedCard = null;
let modalOpen = false;
let currentSort = 'rarity';
let currentTypeFilter = '';
let currentCollectionFilter = '';
let currentRarityFilter = '';

const rarityDisplayNames = {
    'NONE': 'COMMON',
    'WHITE': 'COMMON',
    'BLUE': 'RARE',
    'GREEN': 'UNCOMMON',
    'ORANGE': 'MYTHIC',
    'ORANGE_PLUS': 'MYTHIC PLUS',
    'PURPLE': 'EPIC',
    'PURPLE_PLUS': 'EPIC PLUS',
    'RED': 'ARTIFACT'
};

const rarityCardImages = {
    'NONE': 'assets/images/card/COMMON.png',
    'WHITE': 'assets/images/card/COMMON.png',
    'BLUE': 'assets/images/card/RARE.png',
    'GREEN': 'assets/images/card/UNCOMMON.png',
    'ORANGE': 'assets/images/card/MYTHIC.png',
    'ORANGE_PLUS': 'assets/images/card/MYTHIC_PLUS.png',
    'PURPLE': 'assets/images/card/EPIC.png',
    'PURPLE_PLUS': 'assets/images/card/EPIC_PLUS.png',
    'RED': 'assets/images/card/ARTIFACT.png'
};

const changelog = [
    { date: "2025-09-03", changes: ["Updated main title to 'TSun FF-ITEMS'.", "Redesigned Changelog button and modal.", "Replaced Credits button with styled text in the menu."] },
    { date: "2024-09-02", changes: ["Added a new 'Changelog' feature to track updates.", "Improved the UI for a more modern look and feel."] },
    { date: "2024-08-28", changes: ["Fixed a bug where the search filter was not working correctly.", "Added new items to the database."] },
    { date: "2024-08-15", changes: ["The initial release of the FFItems website.", "Added over 1000 items to the database."] },
    { date: "2024-08-01", changes: ["Beta testing phase started.", "Added sorting options for items."] },
    { date: "2024-07-20", changes: ["Added a new 'Rarity' filter.", "Improved the image loading speed."] }
];

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("loadingDot").style.display = "none";
        document.getElementById("container").style.display = "block";
    }, 1000);

    fetchIcons();
    
    document.getElementById("menuButton").addEventListener("click", toggleSidebar);
    document.getElementById("sidebarClose").addEventListener("click", toggleSidebar);
    document.getElementById("search").addEventListener("input", filterIcons);
    
    document.getElementById("rarityMenu").addEventListener("click", () => toggleSubmenu('rarity'));
    document.getElementById("sortMenu").addEventListener("click", () => toggleSubmenu('sort'));
    document.getElementById("collectionsMenu").addEventListener("click", () => toggleSubmenu('collections'));
    document.getElementById("typesMenu").addEventListener("click", () => toggleSubmenu('types'));
    document.getElementById("changelogButton").addEventListener("click", openChangelogModal);

    document.addEventListener('touchmove', function(e) {
        if (modalOpen) {
            e.preventDefault();
        }
    }, { passive: false });
});

function toggleSubmenu(type) {
    const menuItem = document.getElementById(`${type}Menu`);
    const submenu = document.getElementById(`${type}Submenu`);
    menuItem.classList.toggle('active');
    submenu.classList.toggle('open');
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
    const menuButton = document.getElementById("menuButton");
    if (sidebar.classList.contains("open")) {
        menuButton.innerHTML = '<i class="fas fa-bars" style="color:#F9F9F9"></i>';
    } else {
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

async function fetchIcons() {
    try {
        const response = await fetch("assets/itemData.json");
        const data = await response.json();
        
        iconsData = data.map(item => ({
            itemId: item["itemID"],
            name: item["description"],
            iconName: item["icon"],
            description: item["description"],
            description2: item["description2"],
            itemType: item["itemType"] ? item["itemType"].replace(/_/g, ' ') : '',
            collectionType: item["collectionType"] ? item["collectionType"].replace(/_/g, ' ') : '',
            Rare: item["Rare"],
            displayRarity: rarityDisplayNames[item["Rare"]] || item["Rare"],
            cardImageUrl: rarityCardImages[item["Rare"]] || 'assets/images/card/COMMON.png',
            iconUrl: `https://cdn.jsdelivr.net/gh/9112000/OB49@main/ICONS/${item["itemID"]}.png`
        }));

        iconsData.forEach(item => {
            if (item.itemType) uniqueFilters.itemType.add(item.itemType);
            if (item.displayRarity) uniqueFilters.Rare.add(item.displayRarity);
            if (item.collectionType) uniqueFilters.collectionType.add(item.collectionType);
        });

        populateFilterButtons("filter-Rare-buttons", uniqueFilters.Rare, "Rare");
        populateFilterButtons("filter-sort-buttons", new Set(["ID", "Name", "Rarity"]), "sort");
        populateFilterButtons("filter-collectionType-buttons", uniqueFilters.collectionType, "collectionType");
        populateFilterButtons("filter-itemType-buttons", uniqueFilters.itemType, "itemType");
        
        populateFilterTabs();

        filteredData = [...iconsData];
        sortIcons();
        renderIcons();
        
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q');
        if (query) {
            document.getElementById('search').value = query;
            filterIcons();
        }
    } catch (error) {
        console.error("Failed to retrieve Icons:", error);
        showError();
    }
}

function populateFilterButtons(containerId, values, filterType) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    Array.from(values).sort().forEach(value => {
        if (!value) return;
        
        const button = document.createElement("button");
        button.className = 'sidebar-filter-button';
        button.textContent = value;
        button.dataset.filterType = filterType;
        button.dataset.filterValue = value;
        
        button.onclick = function() {
            const buttons = container.querySelectorAll('.sidebar-filter-button');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            if (filterType === 'sort') {
                button.classList.add('active');
                currentSort = value.toLowerCase();
                sortIcons();
                renderIcons();
            } else {
                const isActive = button.classList.contains('active');
                buttons.forEach(btn => btn.classList.remove('active'));
                
                if (!isActive) {
                    button.classList.add('active');
                    
                    if (filterType === 'Rare') {
                        currentRarityFilter = value;
                    } else if (filterType === 'collectionType') {
                        currentCollectionFilter = value;
                    } else if (filterType === 'itemType') {
                        currentTypeFilter = value;
                    }
                } else {
                    if (filterType === 'Rare') {
                        currentRarityFilter = '';
                    } else if (filterType === 'collectionType') {
                        currentCollectionFilter = '';
                    } else if (filterType === 'itemType') {
                        currentTypeFilter = '';
                    }
                }
                
                applyFilters();
            }
        };
        
        if (filterType === 'sort' && value.toLowerCase() === currentSort) {
            button.classList.add('active');
        }
        
        container.appendChild(button);
    });
}

function populateFilterTabs() {
    const filterTabs = document.getElementById("filterTabs");
    filterTabs.innerHTML = '';
    
    const allTab = document.createElement("button");
    allTab.className = 'filter-tab active';
    allTab.textContent = 'ALL';
    allTab.onclick = () => {
        currentTypeFilter = '';
        currentCollectionFilter = '';
        currentRarityFilter = '';
        
        document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
        allTab.classList.add('active');
        
        document.querySelectorAll('.sidebar-filter-button').forEach(btn => {
            if (btn.dataset.filterType !== 'sort') {
                btn.classList.remove('active');
            }
        });
        
        applyFilters();
    };
    filterTabs.appendChild(allTab);
    
    Array.from(uniqueFilters.itemType).sort().forEach(type => {
        if (!type) return;
        const tab = document.createElement("button");
        tab.className = 'filter-tab';
        tab.textContent = type;
        tab.onclick = () => {
            currentTypeFilter = type;
            currentCollectionFilter = '';
            currentRarityFilter = '';
            
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.sidebar-filter-button').forEach(btn => {
                if (btn.dataset.filterType !== 'sort') {
                    btn.classList.remove('active');
                }
            });
            
            const typeButton = document.querySelector(`.sidebar-filter-button[data-filter-value="${type}"]`);
            if (typeButton) typeButton.classList.add('active');
            
            applyFilters();
        };
        filterTabs.appendChild(tab);
    });
    
    Array.from(uniqueFilters.collectionType).sort().forEach(collection => {
        if (!collection) return;
        const tab = document.createElement("button");
        tab.className = 'filter-tab';
        tab.textContent = collection;
        tab.onclick = () => {
            currentCollectionFilter = collection;
            currentTypeFilter = '';
            currentRarityFilter = '';
            
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.sidebar-filter-button').forEach(btn => {
                if (btn.dataset.filterType !== 'sort') {
                    btn.classList.remove('active');
                }
            });
            
            const collectionButton = document.querySelector(`.sidebar-filter-button[data-filter-value="${collection}"]`);
            if (collectionButton) collectionButton.classList.add('active');
            
            applyFilters();
        };
        filterTabs.appendChild(tab);
    });
}

function showError() {
    const grid = document.getElementById("iconGrid");
    grid.innerHTML = `<div class="no-results">Failed to load items. Please try again later.</div>`;
}

function applyFilters() {
    const searchQuery = document.getElementById("search").value.toLowerCase();
    
    filteredData = iconsData.filter(item => {
        const matchesSearch = searchQuery === '' || 
            item.name.toLowerCase().includes(searchQuery) ||
            item.itemId.toString().includes(searchQuery) ||
            item.iconName.toLowerCase().includes(searchQuery);
        
        const matchesType = !currentTypeFilter || item.itemType === currentTypeFilter;
        const matchesRare = !currentRarityFilter || item.displayRarity === currentRarityFilter;
        const matchesCollection = !currentCollectionFilter || item.collectionType === currentCollectionFilter;
        
        return matchesSearch && matchesType && matchesRare && matchesCollection;
    });
    
    sortIcons();
    currentPage = 0;
    renderIcons();
}

function sortIcons() {
    if (currentSort === 'name') {
        filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'id') {
        filteredData.sort((a, b) => a.itemId - b.itemId);
    } else if (currentSort === 'rarity') {
        const rarityOrder = {
            'COMMON': 1,
            'UNCOMMON': 2,
            'RARE': 3,
            'EPIC': 4,
            'EPIC PLUS': 5,
            'MYTHIC': 6,
            'MYTHIC PLUS': 7,
            'ARTIFACT': 8
        };
        
        filteredData.sort((a, b) => {
            const aRarity = rarityOrder[a.displayRarity] || 0;
            const bRarity = rarityOrder[b.displayRarity] || 0;
            return bRarity - aRarity || a.itemId - b.itemId;
        });
    }
}

function renderIcons() {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const visibleIcons = filteredData.slice(start, end);
    
    const grid = document.getElementById("iconGrid");
    grid.innerHTML = "";

    if (filteredData.length === 0) {
        grid.innerHTML = `<div class="no-results">No items found matching your criteria</div>`;
        document.getElementById("pagination").innerHTML = "";
        return;
    }

    visibleIcons.forEach((icon, index) => {
        const card = document.createElement("div");
        card.className = "icon-card";
        card.dataset.index = start + index;
        card.onclick = (e) => {
            document.querySelectorAll('.icon-card').forEach(c => {
                c.classList.remove('active');
            });
            card.classList.add('active');
            lastClickedCard = card;
            openModal(
                icon.name,
                icon.itemId,
                icon.iconName,
                icon.iconUrl,
                icon.description,
                icon.description2,
                icon.itemType,
                icon.displayRarity
            );
        };
        
        const cardContainer = document.createElement("div");
        cardContainer.style.position = "relative";
        cardContainer.style.width = "100%";
        cardContainer.style.height = "100%";
        
        const cardBg = document.createElement("img");
        cardBg.src = icon.cardImageUrl;
        cardBg.alt = icon.name + " card background";
        cardBg.className = "card-bg";
        cardBg.onerror = () => {
            cardBg.src = 'assets/images/error-404.png';
        };
        
        const cardIcon = document.createElement("img");
        cardIcon.src = icon.iconUrl;
        cardIcon.alt = icon.name;
        cardIcon.className = "card-icon";
        cardIcon.onerror = () => {
            cardIcon.src = 'assets/images/error-404.png';
        };
        
        cardContainer.appendChild(cardBg);
        cardContainer.appendChild(cardIcon);
        card.appendChild(cardContainer);
        grid.appendChild(card);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = "";

    for (let i = 0; i < totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i + 1;
        button.classList.toggle("active", i === currentPage);
        button.onclick = () => changePage(i);
        paginationDiv.appendChild(button);
    }
}

function changePage(page) {
    currentPage = page;
    renderIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterIcons() {
    applyFilters();
}

function openModal(name, itemId, iconName, imageUrl, description, description2, itemType, rare) {
    const modal = document.getElementById("modal");
    const modalImgContainer = document.getElementById("modalImgContainer");
    const modalTempImage = document.getElementById("modalTempImage");
    const modalContent = document.querySelector('.modal-content');
    
    document.getElementById("modalDescription").textContent = description || "No description available";
    document.getElementById("modalDescription2").textContent = description2 || "No additional description";
    document.getElementById("modalItemId").textContent = itemId || "Unknown";
    document.getElementById("modalIconName").textContent = iconName || "Unknown";
    document.getElementById("modalType").textContent = itemType || "Unknown";
    document.getElementById("modalRare").textContent = rare || "Unknown";
    
    const modalImg = document.getElementById("modalImage");
    modalImg.src = imageUrl;
    modalImg.onerror = () => {
        modalImg.src = 'assets/images/error-404.png';
    };
    
    modalTempImage.src = imageUrl;
    modalTempImage.onerror = () => {
        modalTempImage.src = 'assets/images/error-404.png';
    };
    
    const cardRect = lastClickedCard.getBoundingClientRect();
    const cardImg = lastClickedCard.querySelector('img');
    
    modalImgContainer.style.width = `${cardImg.width}px`;
    modalImgContainer.style.height = `${cardImg.height}px`;
    modalImgContainer.style.left = `${cardRect.left + (cardRect.width - cardImg.width)/2}px`;
    modalImgContainer.style.top = `${cardRect.top + (cardRect.height - cardImg.height)/2}px`;
    modalImgContainer.style.transform = 'none';
    
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    modalOpen = true;
    
    setTimeout(() => {
        const modalRect = modal.getBoundingClientRect();
        const targetLeft = modalRect.left + (modalRect.width - 100)/2;
        const targetTop = modalRect.top + 50;
        
        modalImgContainer.style.width = '100px';
        modalImgContainer.style.height = '100px';
        modalImgContainer.style.left = `${targetLeft}px`;
        modalImgContainer.style.top = `${targetTop}px`;
        
        setTimeout(() => {
            modalContent.style.opacity = '1';
        }, 150);
    }, 10);
}

function closeModal() {
    const modal = document.getElementById("modal");
    const modalImgContainer = document.getElementById("modalImgContainer");
    const modalContent = document.querySelector('.modal-content');
    
    if (!lastClickedCard) {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
        modalOpen = false;
        return;
    }
    
    modalContent.style.opacity = '0';
    
    const cardRect = lastClickedCard.getBoundingClientRect();
    const cardImg = lastClickedCard.querySelector('img');
    
    modalImgContainer.style.width = `${cardImg.width}px`;
    modalImgContainer.style.height = `${cardImg.height}px`;
    modalImgContainer.style.left = `${cardRect.left + (cardRect.width - cardImg.width)/2}px`;
    modalImgContainer.style.top = `${cardRect.top + (cardRect.height - cardImg.height)/2}px`;
    modalImgContainer.style.transform = 'none';
    
    setTimeout(() => {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
        modalOpen = false;
    }, 300);
}

function openChangelogModal() {
    const modal = document.getElementById("changelogModal");
    const changelogHistory = document.getElementById("changelogHistory");
    changelogHistory.innerHTML = "";
    changelog.forEach(item => {
        const entry = document.createElement("div");
        entry.className = "changelog-entry";
        entry.innerHTML = `<h3>${item.date}</h3><ul>${item.changes.map(change => `<li>${change}</li>`).join('')}</ul>`;
        changelogHistory.appendChild(entry);
    });
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    modalOpen = true;
}

function closeChangelogModal() {
    const modal = document.getElementById("changelogModal");
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    modalOpen = false;
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal && modalOpen) {
        closeModal();
    }
    
    const changelogModal = document.getElementById('changelogModal');
    if (event.target === changelogModal && modalOpen) {
        closeChangelogModal();
    }
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("sw.js")
            .then(reg => console.log("Service worker registered", reg))
            .catch(err => console.error("Service worker registration failed", err));
    });
}
