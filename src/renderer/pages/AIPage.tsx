import React, { useState } from 'react';
import { Chat, ContactList } from '@nojsja/react-chat';
import { Container } from '@material-ui/core';

import { useStylesOfAI } from '@renderer/pages/styles';
import { IContact } from '@nojsja/react-chat/dist/esm/types';

const contactList: IContact[] = [
  {
    id: 1,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Fizz.png',
    nickname: '菲兹',
    message: '你抓不到我！',
    date: 1610016880,
  },
  {
    id: 8,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Khazix.png',
    nickname: '卡兹克',
    message: '❓',
    date: 1610016880,
  },
  {
    id: 7,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Jayce.png',
    nickname: '杰斯',
    message: '吃我一炮',
    date: 1610016880,
  },
  {
    id: 16,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Jinx.png',
    nickname: '金克丝',
    message: '起飞🤣 ！！！',
    date: 1610016880,
  },
  {
    id: 2,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Vladimir.png',
    nickname: '弗拉基米尔',
    message: '让我嘬一口...',
    date: 1610016880,
  },
  {
    id: 3,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/XinZhao.png',
    nickname: '阿信',
    message: '寒芒，我是寒芒！',
    date: 1610016880,
  },
  {
    id: 4,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Caitlyn.png',
    nickname: '凯特琳',
    message: '超级瞄准已部署。',
    date: 1610016880,
  },
  {
    id: 5,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Teemo.png',
    nickname: '提莫',
    message: '这波团我想活下来',
    date: 1610016880,
  },
  {
    id: 6,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Volibear.png',
    nickname: '沃利贝尔',
    message: '熊大呢？',
    date: 1610016880,
  },

  {
    id: 9,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Rengar.png',
    nickname: '雷恩加尔',
    message: '您已被该玩家禁言',
    date: 1610016880,
  },
  {
    id: 11,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Chogath.png',
    nickname: '科加斯',
    message: '您已被该玩家禁言',
    date: 1610016880,
  },
  {
    id: 12,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Amumu.png',
    nickname: '阿木木',
    message: '您已被该玩家禁言这是我的第一条信这是我的第一条信',
    date: 1610016880,
  },
  {
    id: 13,
    avatar: '//game.gtimg.cn/images/lol/act/img/champion/Draven.png',
    nickname: '德莱文',
    message: '您已被该玩家禁言',
    date: 1610016880,
  },
];

const me = {
  id: 1,
  avatar: '//game.gtimg.cn/images/lol/act/img/champion/Jinx.png',
  nickname: 'Me',
  message: '这是一条信息222222222',
  date: Math.floor(new Date().getTime() / 1000),
  desc: '一行简短的简介',
};

const AIPage: React.FC = () => {
  const [contact, setContact] = useState(contactList[0]);
  const styles = useStylesOfAI();

  return (
    <Container className={styles.contentWrapper}>
      <ContactList
        data={contactList}
        onSelect={(contact: IContact) => setContact(contact)}
      />
      <Chat
        contact={contact}
        me={me}
        chatList={[
          {
            _id: '1',
            date: Math.floor(new Date().getTime() / 1000),
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
