import React from 'react';
import styles from './Footer.module.css';

// default export for footer which display team member and website purpose
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider} />
      <div className={styles.content}>
        <p className={styles.copyright}>
          <span>Literary Discovery and Reading Platform</span>
          {' - © 2024 All Rights Reserved'}
        </p>
        <p className={styles.credits}>
          by Tong, Wanyu, Yuan, and Lingyan
        </p>
      </div>
    </footer>
  );
};

export default Footer;
