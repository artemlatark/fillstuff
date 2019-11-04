import React from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from 'src/components/Header/index.module.css';

const TitlePageOrLogo = props => {
	const {
		pageTitle,
		// theme,
		pageParams,
	} = props;

	if (pageParams && pageParams.backToPage !== undefined) {
		return (
			<div className={styles.columnGroup_left}>
				<Link className={styles.backToPage} to={pageParams.backToPage}>
					<FontAwesomeIcon className={styles.backToPageIcon} icon={['far', 'angle-left']} />
					<div className={styles.titlePage}>{pageTitle}</div>
				</Link>
			</div>
		);
	} else {
		return (
			<div className={styles.columnGroup_left}>
				<div className={styles.titlePage}>{pageTitle}</div>
				{/*{theme !== 'bg' ? <div className={styles.titlePage}>{pageTitle}</div> : <Link className={styles.logo} to="/stocks" />}*/}
			</div>
		);
	}
};

export default TitlePageOrLogo;