import React, { useState } from 'react';
import { Chat, ContactList } from '@nojsja/react-chat';
import { Container } from '@material-ui/core';

import { useStylesOfAI } from '@renderer/pages/styles';

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
  const [contact, setContact] = useState<ContactItem>(contactList[0]);
  const styles = useStylesOfAI();

  return (
    <Container className={styles.contentWrapper}>
      <ContactList
        data={contactList}
        onSelect={(contact: ContactItem) => setContact(contact)}
      />
      <Chat
        contact={contact}
        me={me}
        chatList={[
          {
            _id: '1',
            date: '1212121212',
            user: me,
            message: {
              type: 'text',
              content: 'test text',
            },
          },
        ]}
        onSend={(msg: any) => console.log(msg)}
      />
    </Container>
  );
};

export default AIPage;
