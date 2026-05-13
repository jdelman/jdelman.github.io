const dataUrl = "data.json";

const decodeHtml = (value) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const formatHours = (hours) => {
  const entries = Object.entries(hours || {});
  if (!entries.length) {
    return "Hours not listed";
  }
  return entries
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join(" · ");
};

const buildMenuIndex = (restaurants) => {
  const index = [];
  restaurants.forEach((restaurant) => {
    restaurant.menus.forEach((menu) => {
      menu.items.forEach((item) => {
        const trimmed = item.trim();
        if (!trimmed) return;
        index.push({
          item: trimmed,
          itemNormalized: normalize(trimmed),
          restaurant: restaurant.name,
          location: restaurant.location,
          attire: restaurant.dress_code || "Attire not listed",
          hours: formatHours(restaurant.hours),
        });
      });
    });
  });
  return index;
};

const renderRestaurants = (restaurants) => {
  const list = document.getElementById("restaurantList");
  const count = document.getElementById("restaurantCount");
  count.textContent = `${restaurants.length} restaurants listed.`;
  list.innerHTML = "";

  restaurants.forEach((restaurant) => {
    const card = document.createElement("article");
    card.className = "restaurant-card";

    const name = document.createElement("h3");
    name.textContent = restaurant.name;

    const description = document.createElement("p");
    description.className = "muted";
    description.textContent = restaurant.description || "Description not listed.";

    const badges = document.createElement("div");
    badges.className = "badges";

    const location = document.createElement("span");
    location.className = "badge";
    location.textContent = restaurant.location;

    const attire = document.createElement("span");
    attire.className = "badge";
    attire.textContent = restaurant.dress_code || "Attire not listed";

    badges.append(location, attire);

    const hours = document.createElement("p");
    hours.className = "muted";
    hours.textContent = formatHours(restaurant.hours);

    const menuDetails = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = restaurant.menus.length ? "Menu items" : "Menu items (not listed)";
    menuDetails.append(summary);

    const menuList = document.createElement("ul");
    menuList.className = "menu-list";

    const items = restaurant.menus.flatMap((menu) => menu.items || []);
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "menu-empty";
      empty.textContent = "Menu items not available for this restaurant yet.";
      menuDetails.append(empty);
    } else {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        menuList.append(li);
      });
      menuDetails.append(menuList);
    }

    card.append(name, description, badges, hours, menuDetails);
    list.append(card);
  });
};

const renderSearchResults = (results, query) => {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (!query) {
    container.innerHTML = '<p class="muted">Start typing to search the menu index.</p>';
    return;
  }

  if (!results.length) {
    container.innerHTML = '<p class="muted">No menu items match that search.</p>';
    return;
  }

  results.forEach((result) => {
    const card = document.createElement("div");
    card.className = "result-card";

    const title = document.createElement("h3");
    title.textContent = result.item;

    const meta = document.createElement("div");
    meta.className = "result-meta";

    const restaurant = document.createElement("div");
    restaurant.textContent = `Restaurant: ${result.restaurant}`;

    const hours = document.createElement("div");
    hours.textContent = `Hours: ${result.hours}`;

    const location = document.createElement("div");
    location.textContent = `Location: ${result.location}`;

    const attire = document.createElement("div");
    attire.textContent = `Attire: ${result.attire}`;

    meta.append(restaurant, hours, location, attire);
    card.append(title, meta);
    container.append(card);
  });
};

const init = async () => {
  const response = await fetch(dataUrl);
  const rawRestaurants = await response.json();

  const restaurants = rawRestaurants.map((restaurant) => ({
    ...restaurant,
    name: decodeHtml(restaurant.name),
    location: decodeHtml(restaurant.location),
    description: decodeHtml(restaurant.description),
    dress_code: decodeHtml(restaurant.dress_code || ""),
    menus: (restaurant.menus || []).map((menu) => ({
      ...menu,
      items: (menu.items || []).map((item) => decodeHtml(item)),
    })),
  }));

  const menuIndex = buildMenuIndex(restaurants);
  const searchInput = document.getElementById("menuSearch");

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    if (!query) {
      renderSearchResults([], "");
      return;
    }

    const normalizedQuery = normalize(query);
    const results = menuIndex
      .filter((entry) => entry.itemNormalized.includes(normalizedQuery))
      .slice(0, 40);

    renderSearchResults(results, query);
  });

  renderRestaurants(restaurants);
};

init();
