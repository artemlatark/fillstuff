import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ClassNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import Dropdown from 'src/components/Dropdown';

import ColumnLeft from './components/ColumnLeft';

import { logout } from 'src/actions/authentication';

import styles from './index.module.css';

class Header extends Component {
	state = {
		dropdownProfile: false,
	};

	refDropdownProfile = createRef();

	onHandleDropdownProfile = () => this.setState({ dropdownProfile: !this.state.dropdownProfile });

	onLogout = () => {
		this.props.logout();
	};

	render() {
		const { pageName, pageTitle, theme, position = 'sticky', currentUser, currentStock, pageParams } = this.props;
		const { dropdownProfile } = this.state;

		let headerClasses = ClassNames({
			[styles.container]: true,
			[styles.container_themeBg]: theme === 'bg',
		});

		return (
			<AppBar className={headerClasses} position={position} elevation={0}>
				<ColumnLeft
					pageName={pageName}
					pageTitle={pageTitle}
					theme={theme}
					currentUser={currentUser}
					currentStock={currentStock}
					pageParams={pageParams}
				/>
				<div className={styles.column_right}>
					<div className={styles.columnGroup_right}>
						<div className={styles.profile} ref={this.refDropdownProfile} onClick={this.onHandleDropdownProfile}>
							<div className={styles.profileName}>{currentUser.name ? currentUser.name : currentUser.email}</div>
							<div className={styles.profilePhoto}>
								{currentUser.profilePhoto ? <img src={currentUser.profilePhoto} alt="" /> : <FontAwesomeIcon icon={['fas', 'user-alt']} />}
							</div>
							<FontAwesomeIcon icon={['fas', 'angle-down']} className={dropdownProfile ? 'open' : ''} />
						</div>
					</div>
				</div>

				<Dropdown anchor={this.refDropdownProfile} open={dropdownProfile} onClose={this.onHandleDropdownProfile} placement="bottom-end">
					<MenuList>
						<MenuItem
							to={'/settings'}
							component={React.forwardRef((props, ref) => (
								<Link innerRef={ref} {...props} />
							))}
							onClick={this.onHandleDropdownProfile}
						>
							Настройки аккаунта
						</MenuItem>
						<MenuItem onClick={this.onHandleDropdownProfile}>Оплата</MenuItem>
					</MenuList>
					<Divider />
					<MenuList>
						<MenuItem onClick={this.onLogout}>Выйти</MenuItem>
					</MenuList>
				</Dropdown>
			</AppBar>
		);
	}
}

const mapStateToProps = state => {
	const stockIndex = state.stocks.data.findIndex(stock => stock._id === state.user.data.activeStockId);

	return {
		currentUser: state.user.data,
		currentStock: state.user.data.activeStockId ? state.stocks.data[stockIndex] : null,
		stocks: state.stocks.data,
	};
};

const mapDispatchToProps = () => {
	return {
		logout: () => logout(),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Header);
