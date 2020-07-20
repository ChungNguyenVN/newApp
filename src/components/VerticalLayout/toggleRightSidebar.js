export const toggleRightSidebar = () => ({
	type: TOGGLE_RIGHT_SIDEBAR,
	payload: null
});

export const changeLayout = layout => ({
	type: CHANGE_LAYOUT,
	payload: layout
});


export const changeLayoutWidth = width => ({
	type: CHANGE_LAYOUT_WIDTH,
	payload: width
});

export const changeSidebarTheme = theme => ({
	type: CHANGE_SIDEBAR_THEME,
	payload: theme
});

export const changeSidebarType = (sidebarType, isMobile) => {
	return {
		type: CHANGE_SIDEBAR_TYPE,
		payload: { sidebarType, isMobile }
	};
};

export const changeTopbarTheme = topbarTheme => ({
	type: CHANGE_TOPBAR_THEME,
	payload: topbarTheme
});

