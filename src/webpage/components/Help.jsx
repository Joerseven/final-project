import React from "react";
import { createUseStyles } from "react-jss";

const classes = createUseStyles({
  wrapper: {
    width: "90%",
    margin: "0 auto",
  },
});

const Help = () => {
  const style = classes();

  return (
    <section className={style.wrapper}>
      <h1>Help/Questions</h1>
      <h2>Get started!</h2>
      <p>To get started, just go to create lockbox, to the left side here. When you&lsquo;ve done that, create your key. You&lsquo;ll get a strange looking message,
        in your email account, open the actionmenu, click on &lsquo;Open&lsquo; and then click on the padlock. Put in the password you just did, and there will be a link inside. 
        Click on the link to verify. Your lockbox is ready! Now anyone can download a lockbox to secure data in to send to you by simply typing in your email address.
      </p>
      <h2>What to do when the box says something went wrong.</h2>
      <p>
        If it says that something has gone wrong, then there are a few possible reasons.<br/>
        1 - You&lsquo;ve put in the password incorrectly.<br/>
        2 - You&lsquo;re not using the right lockbox. Remember that the key that the program uses is the one with the green default sign next to it.<br/>
        Make sure you&lsquo;ve selected the right key!
        Remember, if you&lsquo;d like someone to send you sensitive data, then you use a lockbox that you have a key for.
        If you&lsquo;d like to send someone else sensitive data, then you want to look up their lockbox, and use it to lock up the data.
      </p>
    </section>
  );
};

export default Help;
