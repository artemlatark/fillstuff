import React, { useState, useRef } from 'react';
import moment from 'moment';
import { Field, Form } from 'formik';
import ClassNames from 'classnames';
import DatePicker from 'react-datepicker';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import List from '@material-ui/core/List';
import MenuList from '@material-ui/core/MenuList';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormLabel from '@material-ui/core/FormLabel';

import { memberRoleTransform } from 'shared/roles-access-rights';

import { weekActive, monthActive, paginationCalendarFormat } from 'src/components/Pagination/utils';
import Dropdown from 'src/components/Dropdown';
import PositionSummary from 'src/components/PositionSummary';
import MenuItem from 'src/components/MenuItem';
import UserSummary from 'src/components/UserSummary';
import HeaderDatepicker from 'src/components/Datepicker/Header';

import { SearchTextField, FilterSearchTextField } from '../components/Filter.styles';
import styles from './Filter.module.css';

const FilterMemberTransform = (memberSelected, members, loading) => {
	if (memberSelected !== 'all') {
		if (loading) return <CircularProgress size={13} />;

		if (members && members.length) {
			const member = members.find(member => member._id === memberSelected);

			return member ? member.user.name : null;
		} else {
			return 'Не найдено';
		}
	} else {
		return 'Все участники';
	}
};
const findMemberByName = (member, searchText) => {
	const searchTextLowercase = String(searchText).toLowerCase();

	const memberName = member.user.name.toLowerCase();

	return memberName.indexOf(searchTextLowercase) !== -1;
};

const FilterPositionTransform = (positionSelected, positions, loading) => {
	if (positionSelected === 'all') {
		return 'Все позиции';
	} else {
		if (loading) return <CircularProgress size={13} />;

		if (positions && positions.length) {
			const position = positions.find(position => position._id === positionSelected);

			return position ? position.name : null;
		} else {
			return 'Не найдено';
		}
	}
};
const findPositionByFullName = (position, searchText) => {
	const searchTextLowercase = String(searchText).toLowerCase();

	const positionName = position.characteristics
		.reduce((fullName, characteristic) => `${fullName} ${characteristic.name}`, position.name)
		.toLowerCase();

	return positionName.indexOf(searchTextLowercase) !== -1;
};

const DropdownFooter = props => {
	const { onResetHandler, isSubmitting, disabledSubmit } = props;

	return (
		<Grid className={styles.dropdownFooter} alignItems="center" justifyContent="center" container>
			{typeof onResetHandler === 'function' ? (
				<Grid className={styles.dropdownFooterColumn} item>
					<Button onClick={onResetHandler} disabled={isSubmitting} size="small" variant="outlined">
						Сбросить
					</Button>
				</Grid>
			) : null}
			<Grid className={styles.dropdownFooterColumn} item>
				<Button
					type="submit"
					disabled={disabledSubmit ? isSubmitting || disabledSubmit : isSubmitting}
					size="small"
					variant="contained"
					color="primary"
				>
					Сохранить
				</Button>
			</Grid>
		</Grid>
	);
};

const FormFilter = props => {
	const {
		handlerDropdown,
		onChangeFilterInvoiceNumber,
		onClearFilterInvoiceNumber,
		onChangeFilterDate,
		onChangeFilterPosition,
		onChangeFilterMember,
		onResetAllFilters,
		members: {
			data: allMembers,
			isFetching: isLoadingAllMembers,
			// error: errorMembers
		},
		positions: {
			data: allPositions,
			isFetching: isLoadingAllPositions,
			// error: errorPositions
		},
		refFilterInvoiceNumberInput,
		dropdownDate: { state: dropdownDate, ref: refDropdownDate },
		dropdownDateRange: { state: dropdownDateRange, ref: refDropdownDateRange },
		dropdownPosition: { state: dropdownPosition, ref: refDropdownPosition },
		dropdownMember: { state: dropdownMember, ref: refDropdownMember },
		formikProps: {
			// errors,
			isSubmitting,
			values,
			setFieldValue,
			submitForm,
		},
	} = props;
	const searchTextFieldMember = useRef(null);
	const [searchTextMember, setSearchTextMember] = useState('');
	const searchTextFieldPosition = useRef(null);
	const [searchTextPosition, setSearchTextPosition] = useState('');

	const onTypeSearchTextMember = ({ target: { value } }) => setSearchTextMember(value);

	const onClearSearchTextMember = () => {
		setSearchTextMember('');

		searchTextFieldMember.current.focus();
	};

	const onTypeSearchTextPosition = ({ target: { value } }) => setSearchTextPosition(value);

	const onClearSearchTextPosition = () => {
		setSearchTextPosition('');

		searchTextFieldPosition.current.focus();
	};

	const members = !isLoadingAllMembers && allMembers ? allMembers.filter(member => findMemberByName(member, searchTextMember)) : null;

	const positions =
		!isLoadingAllPositions && allPositions ? allPositions.filter(position => findPositionByFullName(position, searchTextPosition)) : null;

	const isWeekActive = currentWeek => weekActive(values.dateStartView, values.dateEndView, currentWeek);
	const isMonthActive = currentMonth => monthActive(values.dateStartView, values.dateEndView, currentMonth);

	return (
		<Form>
			<div className={styles.topContainer}>
				<Field
					inputRef={refFilterInvoiceNumberInput}
					name="invoiceNumber"
					as={SearchTextField}
					inputProps={{
						onChange: event => onChangeFilterInvoiceNumber(event, setFieldValue, submitForm),
					}}
					placeholder="Поиск по номеру чека или накладной"
					fullWidth
				/>
				{values.invoiceNumber && !isSubmitting ? (
					<ButtonBase
						onClick={() => onClearFilterInvoiceNumber(setFieldValue, submitForm)}
						className={styles.textFieldFilterInvoiceNumberClear}
						tabIndex={-1}
					>
						<FontAwesomeIcon icon={['fal', 'times']} />
					</ButtonBase>
				) : null}
				{isSubmitting ? <CircularProgress className={styles.loadingForm} size={20} /> : null}
			</div>

			<div className={styles.bottomContainer}>
				{/* Filter Date */}
				<div className={styles.bottomContainerItem}>
					<ButtonBase
						ref={refDropdownDate}
						className={styles.filterButtonLink}
						onClick={() => {
							handlerDropdown('dropdownDate');
							handlerDropdown('dropdownDateRange', false);
						}}
					>
						{!values.dateStartView && !values.dateEndView ? (
							<span>За всё время</span>
						) : isMonthActive() ? (
							<span>За текущий месяц</span>
						) : isWeekActive() ? (
							<span>За текущую неделю</span>
						) : !isNaN(values.dateStartView) && !isNaN(values.dateEndView) ? (
							<span>
								{isMonthActive(false)
									? moment(values.dateStartView).calendar(null, paginationCalendarFormat(isMonthActive(false)))
									: moment(values.dateStartView).isSame(values.dateEndView, 'day')
									? moment(values.dateStartView).calendar(null, paginationCalendarFormat(false))
									: moment(values.dateStartView).calendar(null, paginationCalendarFormat(false)) +
									  ' - ' +
									  moment(values.dateEndView).calendar(null, paginationCalendarFormat(false))}
							</span>
						) : (
							'Некорректная дата'
						)}
						{!values.dateStartView && !values.dateEndView ? <FontAwesomeIcon icon={['far', 'angle-down']} /> : null}
					</ButtonBase>
					{values.dateStartView || values.dateEndView ? (
						<ButtonBase
							onClick={() => onChangeFilterDate('allTime', setFieldValue, submitForm)}
							className={styles.filterButtonLinkReset}
							tabIndex={-1}
						>
							<FontAwesomeIcon icon={['far', 'times']} fixedWidth />
						</ButtonBase>
					) : null}
				</div>

				<div className={styles.bottomContainerItem}>
					<ButtonBase
						ref={refDropdownPosition}
						className={styles.filterButtonLink}
						onClick={() => handlerDropdown('dropdownPosition', null)}
					>
						<span>{FilterPositionTransform(values.position, allPositions, isLoadingAllPositions)}</span>
						{values.position === 'all' ? <FontAwesomeIcon icon={['far', 'angle-down']} /> : null}
					</ButtonBase>
					{values.position !== 'all' ? (
						<ButtonBase
							onClick={() => onChangeFilterPosition('all', setFieldValue, submitForm)}
							className={styles.filterButtonLinkReset}
							tabIndex={-1}
						>
							<FontAwesomeIcon icon={['far', 'times']} fixedWidth />
						</ButtonBase>
					) : null}
				</div>
				{/* Filter Position */}

				{/* Filter Member */}
				<div className={styles.bottomContainerItem}>
					<ButtonBase ref={refDropdownMember} className={styles.filterButtonLink} onClick={() => handlerDropdown('dropdownMember', null)}>
						<span>{FilterMemberTransform(values.member, allMembers, isLoadingAllMembers)}</span>
						{values.member === 'all' ? <FontAwesomeIcon icon={['far', 'angle-down']} /> : null}
					</ButtonBase>
					{values.member !== 'all' ? (
						<ButtonBase
							onClick={() => onChangeFilterMember('all', setFieldValue, submitForm)}
							className={styles.filterButtonLinkReset}
							tabIndex={-1}
						>
							<FontAwesomeIcon icon={['far', 'times']} fixedWidth />
						</ButtonBase>
					) : null}
				</div>

				<div className={styles.bottomContainerItem} style={{ marginLeft: 'auto', marginRight: 10 }}>
					{values.dateStartView || values.dateEndView || values.invoiceNumber || values.position !== 'all' || values.member !== 'all' ? (
						<Tooltip title="Сбросить все фильтры">
							<IconButton
								className={ClassNames({
									[styles.filterButtonResetAll]: true,
									destructiveAction: true,
								})}
								onClick={() => onResetAllFilters(setFieldValue, submitForm)}
								color="primary"
							>
								<FontAwesomeIcon icon={['fal', 'times']} fixedWidth />
							</IconButton>
						</Tooltip>
					) : null}
				</div>
			</div>

			{/* Filter Date */}
			<Dropdown
				anchor={refDropdownDate}
				open={dropdownDate}
				onClose={() => handlerDropdown('dropdownDate', false)}
				placement="bottom-start"
				innerContentStyle={{ minWidth: 190 }}
			>
				<MenuList autoFocusItem={dropdownDate} disablePadding>
					<List tabIndex={-1}>
						<MenuItem
							disabled={isSubmitting}
							selected={!values.dateStartView && !values.dateEndView}
							onClick={() => onChangeFilterDate('allTime', setFieldValue, submitForm)}
							tabIndex={0}
						>
							За всё время
						</MenuItem>
						<MenuItem
							disabled={isSubmitting}
							selected={isMonthActive()}
							onClick={() => onChangeFilterDate('currentMonth', setFieldValue, submitForm)}
							tabIndex={0}
						>
							За текущий месяц
						</MenuItem>
						<MenuItem
							disabled={isSubmitting}
							selected={isWeekActive()}
							onClick={() => onChangeFilterDate('currentWeek', setFieldValue, submitForm)}
							tabIndex={0}
						>
							За текущую неделю
						</MenuItem>
					</List>
					<Divider />
					<List tabIndex={-1}>
						<MenuItem
							ref={refDropdownDateRange}
							disabled={isSubmitting}
							onClick={() => {
								handlerDropdown('dropdownDate');
								handlerDropdown('dropdownDateRange');
							}}
							tabIndex={0}
						>
							Указать период
						</MenuItem>
					</List>
				</MenuList>
			</Dropdown>

			<Dropdown
				anchor={refDropdownDate}
				open={dropdownDateRange}
				onClose={() => handlerDropdown('dropdownDateRange', false)}
				placement="bottom-start"
				innerContentStyle={{ minWidth: 190 }}
			>
        <DatePicker
          selected={values.dateStart}
          renderCustomHeader={HeaderDatepicker}
          onChange={dates => {
            const dateStartValue = dates[0] ? moment(dates[0])
              .set({ hour: 0, minute: 0, second: 0 })
              .valueOf() : null;
            const dateEndValue = dates[1] ? moment(dates[1])
              .set({ hour: 23, minute: 59, second: 59 })
              .valueOf() : null;

            setFieldValue('dateStart', dateStartValue);
            setFieldValue('dateEnd', dateEndValue);
          }}
          startDate={values.dateStart}
          endDate={values.dateEnd}
          disabledKeyboardNavigation
          selectsRange
          inline
        />
				<DropdownFooter isSubmitting={isSubmitting} disabledSubmit={!values.dateStart || !values.dateEnd} />
			</Dropdown>

			{/* Filter Position */}
			<Dropdown
				anchor={refDropdownPosition}
				open={dropdownPosition}
				onClose={() => handlerDropdown('dropdownPosition', false)}
				placement="bottom-start"
				header={
					<div className={styles.filterSearchTextFieldContainer}>
						<FilterSearchTextField
							inputRef={searchTextFieldPosition}
							placeholder="Введите название позиции"
							value={searchTextPosition}
							onChange={onTypeSearchTextPosition}
							fullWidth
						/>
						{searchTextPosition ? (
							<ButtonBase onClick={onClearSearchTextPosition} className={styles.filterSearchTextFieldClear} tabIndex={-1}>
								<FontAwesomeIcon icon={['fal', 'times']} />
							</ButtonBase>
						) : null}
					</div>
				}
				innerContentStyle={{ width: 250, maxHeight: 300, overflow: 'auto' }}
			>
				{!isLoadingAllPositions && positions && positions.length ? (
					<MenuList autoFocusItem={dropdownPosition && !searchTextFieldPosition.current}>
						{!searchTextPosition ? (
							<MenuItem
								disabled={isSubmitting}
								selected={values.position === 'all'}
								onClick={() => onChangeFilterPosition('all', setFieldValue, submitForm)}
								tabIndex={0}
							>
								Все позиции
							</MenuItem>
						) : null}
						{positions.map((position, index) => {
							if (position.isArchived && !searchTextPosition) return null;

							const positionBadges = (badges = []) => {
								if (position.isArchived) badges.push('archived');

								return badges;
							};

							return (
								<MenuItem
									key={index}
									disabled={isSubmitting}
									selected={values.position === position._id}
									onClick={() => onChangeFilterPosition(position._id, setFieldValue, submitForm)}
									tabIndex={0}
								>
									<PositionSummary name={position.name} characteristics={position.characteristics} badges={positionBadges()} avatar />
								</MenuItem>
							);
						})}
					</MenuList>
				) : (
					<div style={{ textAlign: 'center', padding: 15 }}>
						{positions && !positions.length && searchTextPosition ? (
							<Typography variant="caption">Ничего не найдено</Typography>
						) : positions && !positions.length ? (
							<Typography variant="caption">Позиций не создано</Typography>
						) : (
							<CircularProgress size={20} />
						)}
					</div>
				)}
			</Dropdown>

			{/* Filter Member */}
			<Dropdown
				anchor={refDropdownMember}
				open={dropdownMember}
				onClose={() => handlerDropdown('dropdownMember', false)}
				placement="bottom-start"
				header={
					<div className={styles.filterSearchTextFieldContainer}>
						<FilterSearchTextField
							inputRef={searchTextFieldMember}
							placeholder="Введите имя"
							value={searchTextMember}
							onChange={onTypeSearchTextMember}
							fullWidth
						/>
						{searchTextMember ? (
							<ButtonBase onClick={onClearSearchTextMember} className={styles.filterSearchTextFieldClear} tabIndex={-1}>
								<FontAwesomeIcon icon={['fal', 'times']} />
							</ButtonBase>
						) : null}
					</div>
				}
				innerContentStyle={{ width: 250, maxHeight: 305, overflow: 'auto' }}
			>
				{!isLoadingAllMembers && members && members.length ? (
					<>
						{members.filter(member => !member.deactivated).length ? (
							<MenuList autoFocusItem={dropdownMember && !searchTextFieldMember.current}>
								{!searchTextMember ? (
									<MenuItem
										disabled={isSubmitting}
										selected={values.member === 'all'}
										onClick={() => onChangeFilterMember('all', setFieldValue, submitForm)}
										tabIndex={0}
									>
										Все участники
									</MenuItem>
								) : null}
								{members
									.filter(member => !member.deactivated)
									.map((member, index) => (
										<MenuItem
											key={index}
											disabled={isSubmitting}
											selected={values.member === member._id}
											onClick={() => onChangeFilterMember(member._id, setFieldValue, submitForm)}
											tabIndex={0}
										>
											<UserSummary
												src={member.user.picture}
												title={member.user.name}
												subtitle={memberRoleTransform(member.roles).join(', ')}
											/>
										</MenuItem>
									))}
							</MenuList>
						) : null}
						{members.filter(member => member.deactivated).length ? (
							<MenuList>
								<FormLabel style={{ padding: '0 8px 8px' }} component="div">
									Отключённые участники
								</FormLabel>
								{members
									.filter(member => member.deactivated)
									.map((member, index) => (
										<MenuItem
											key={index}
											disabled={isSubmitting}
											selected={values.member === member._id}
											onClick={() => onChangeFilterMember(member._id, setFieldValue, submitForm)}
											tabIndex={0}
										>
											<UserSummary
												src={member.user.picture}
												title={member.user.name}
												subtitle={memberRoleTransform(member.roles).join(', ')}
											/>
										</MenuItem>
									))}
							</MenuList>
						) : null}
					</>
				) : (
					<div style={{ textAlign: 'center', padding: 15 }}>
						{members && !members.length ? <Typography variant="caption">Ничего не найдено</Typography> : <CircularProgress size={20} />}
					</div>
				)}
			</Dropdown>
		</Form>
	);
};

export default FormFilter;
