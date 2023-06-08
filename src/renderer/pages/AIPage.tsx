import React, { useState } from 'react';
import { Container } from '@material-ui/core';
import { Chat, ContactList } from 'react-jwchat';

import { useStylesOfAI as useStyles } from './styles';

interface ContactItem {
  id: number;
  avatar: string;
  nickname: string;
  message: string;
  date: string;
  desc: string;
}

const contactList: ContactItem[] = [
  {
    id: 16,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Jinx.png',
    nickname: '金克丝',
    message: '这是一条信息',
    date: '02-11',
    desc: '一行简短的简介',
  },
];

const me = {
  id: 1,
  avatar: '//game.gtimg.cn/images/lol/act/img/champion/Jinx.png',
  nickname: 'Me',
  message: '这是一条信息',
  date: '02-11',
  desc: '一行简短的简介',
};

const AIPage: React.FC = () => {
  const styles = useStyles();
  const [contact, setContact] = useState<ContactItem>(contactList[0]);

  return (
    <Container className={styles.container} maxWidth="sm">
      <ContactList
        data={contactList}
        onSelect={(contact: ContactItem) => setContact(contact)}
      />
      <Chat
        contact={contact}
        me={me}
        chatList={[]}
        onSend={(msg: any) => console.log(msg)}
        style={{
          width: 600,
          height: 500,
        }}
      />
    </Container>
  );
};

export default AIPage;
