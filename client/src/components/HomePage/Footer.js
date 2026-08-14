import React from 'react';
import styles from './Footer.module.css';

// default export for footer which displays the website purpose
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider} />
      <div className={styles.content}>
        <p className={styles.copyright}>
          <span>Literary Discovery and Reading Platform</span>
          {' - © 2024 All Rights Reserved'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
