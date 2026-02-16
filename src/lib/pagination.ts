export const paginateItems = (items: any[]) => {
    if (!items || items.length === 0) return [[], []]; // Handle empty (always at least 1 page for metadata)

    const firstPageCapacity = 10;
    const otherPageCapacity = 18;

    const pages = [];
    let currentItems = [...items];

    // Page 1
    pages.push(currentItems.splice(0, firstPageCapacity));

    // Other pages
    while (currentItems.length > 0) {
        pages.push(currentItems.splice(0, otherPageCapacity));
    }

    return pages;
};
