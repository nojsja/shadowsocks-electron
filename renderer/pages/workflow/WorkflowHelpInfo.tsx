import React from 'react';
import Popover from '@material-ui/core/Popover';
import { IconButton } from '@material-ui/core';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';
import i18n from 'i18next';

import { useStylesOfWorkflow } from '../styles';

const InstrunctionEnUs = () => {
  const styles = useStylesOfWorkflow();

  return (
    <div className={styles.headerHelpInfoWrapper}>
      Workflow is a set of tasks that executing in a specific order, you can create a workflow by adding async or sync tasks to it.
      There are some different task types: Source, Processor, Effect.
      <p>
        Ability of workflow makes it easier to create a complex task flow. In my one case, I use workflow for SSR/SS server nodes scraping from internet.
      </p>
      <p>
        One another example is about acheving subscription auto update by a timed schedule, like the unix crontab job and follow the same crontab syntax (* */1 * * *).
      </p>
      <p>
        If you have no idea to create task script, try <b>Load Template Code</b> button to load a simple demo for each task.
      </p>
      <h1>一、Source Task</h1>
      <p>
        For Source type task, generally used to produce data source and then pass data to next task handler. It has three sub types - Puppeteer, Crawler, Node.
      </p>
      <h2>1.1 Puppeteer Source Task</h2>
      <p>
        <a href="https://github.com/puppeteer/puppeteer"> Puppeteer</a> - a headless browser for excuting automate tasks on the web, it supports programming control without an UI interface.
      </p>
      <p>
        When you find Crawler task hard to achieve some functions, remember to try Puppeteer task.
      </p>
      <h2>1.2 Crawler Source Task</h2>
      <p>
        <a href="https://github.com/bda-research/node-crawler"> Crawler</a> - most powerful, popular and web scraping tool for Node.js.
      </p>
      <h2>1.3 Node Source Task</h2>
      <p>
        Node type task is a general task with nodejs native module support (all of other types too), you can use it to execute any nodejs script, such as read/write file system and send http request for remote data fetching.
      </p>
      <h1>二、Processor Task</h1>
      <p>
        For Processor type task, playing role as a middleware between other tasks. It is generally used to process data from previous task, and pass data to next task handler.
      </p>
      <h1>三、Effect Task</h1>
      <p>
        For Effect type task, generally used to produce side effect, such as notification, subscription update, subscription add, server add, etc.
      </p>
      <p>
        All of those abilities are provided by the client inner API service (IPC), waiting for some periods to open more API.
      </p>
    </div>
  )
};

const InstrunctionZhCn = () => {
  const styles = useStylesOfWorkflow();

  return (
    <div className={styles.headerHelpInfoWrapper}>
      工作流是一组以特定顺序执行的任务，您可以通过向其添加异步或同步任务来创建工作流。
      有一些不同的任务类型：源任务、处理器任务、附加效果任务。
      <p>
        工作流功能使创建复杂的任务流程变得更加容易。在我的一个案例中，使用了工作流来从互联网上抓取免费的 SSR/SS 服务器节点。
      </p>
      <p>
        另一个例子是通过定时计划实现订阅自动更新，就像 unix 的 crontab 任务一样，当然也遵循相同的 crontab 语法(* */1 * * *)。
      </p>
      <p>
        如果您不知道如何创建任务脚本，请尝试 <b>加载模板代码</b> 按钮为每个任务加载一个简单的示例。
      </p>
      <h1>一、Source 源任务</h1>
      <p>
        对于源类型任务，一般用于生成数据源，然后将数据传递给下一个任务处理器。它有三个子类型：Puppeteer、Crawler、Node。
      </p>
      <h2>1.1 Puppeteer 源任务</h2>
      <p>
      <a href="https://github.com/puppeteer/puppeteer"> Puppeteer</a> - 用于在 web 上执行自动化任务的无头浏览器，它支持无 UI 界面的编程控制。
      </p>
      <p>
        当你发现 Crawler 爬虫源任务很难实现某些功能时，记得试试 Puppeteer 无头浏览器任务。
      </p>
      <h2>1.2 Crawler 源任务</h2>
      <p>
        <a href="https://github.com/bda-research/node-crawler"> Crawler</a> - Node.js上最强大、流行的 web 爬虫工具。
      </p>
      <h2>1.3 Node 源任务</h2>
      <p>
        Node 类型任务是 nodejs 原生模块(同样适用于所有其他任务)支持的通用任务，可以使用它来执行任何 Nodejs 脚本，例如读/写文件系统和发送 http 请求获取远程数据。
      </p>
      <h1>二、Processor 处理器任务</h1>
      <p>
        对于处理器类型的任务，扮演着任务之间的中间件的角色。它通常用于处理来自前一个任务的数据，并将处理后的数据传递给下一个任务处理程序。
      </p>
      <h1>三、Effect 附加效果任务</h1>
      <p>
        对于附加效果型任务，一般用于产生副作用，如通知、订阅更新、订阅添加、服务器添加、服务器断开、服务器重连等。
      </p>
      <p>
        所有这些功能都是由客户端内部 API 服务(IPC)提供的，之后会有更多的 API 支持。
      </p>
    </div>
  )
};

const InstrunctionRuRu = () => {
  const styles = useStylesOfWorkflow();

  return (
    <div className={styles.headerHelpInfoWrapper}>
      Workflow is a set of tasks that executing in a specific order, you can create a workflow by adding async or sync tasks to it.
      There are some different task types: Source, Processor, Effect.
      <p>
        Ability of workflow makes it easier to create a complex task flow. In my one case, I use workflow for SSR/SS server nodes scraping from internet.
      </p>
      <p>
        One another example is about acheving subscription auto update by a timed schedule, like the unix crontab job and follow the same crontab syntax (* */1 * * *).
      </p>
      <p>
        If you have no idea to create task script, try <b>Load Template Code</b> button to load a simple demo for each task.
      </p>
      <h1>一、Source Task</h1>
      <p>
        For Source type task, generally used to produce data source and then pass data to next task handler. It has three sub types - Puppeteer, Crawler, Node.
      </p>
      <h2>1.1 Puppeteer Source Task</h2>
      <p>
        <a href="https://github.com/puppeteer/puppeteer"> Puppeteer</a> - a headless browser for excuting automate tasks on the web, it supports programming control without an UI interface.
      </p>
      <p>
        When you find Crawler task hard to achieve some functions, remember to try Puppeteer task.
      </p>
      <h2>1.2 Crawler Source Task</h2>
      <p>
        <a href="https://github.com/bda-research/node-crawler"> Crawler</a> - most powerful, popular and web scraping tool for Node.js.
      </p>
      <h2>1.3 Node Source Task</h2>
      <p>
        Node type task is a general task with nodejs native module support (all of other types too), you can use it to execute any nodejs script, such as read/write file system and send http request for remote data fetching.
      </p>
      <h1>二、Processor Task</h1>
      <p>
        For Processor type task, playing role as a middleware between other tasks. It is generally used to process data from previous task, and pass data to next task handler.
      </p>
      <h1>三、Effect Task</h1>
      <p>
        For Effect type task, generally used to produce side effect, such as notification, subscription update, subscription add, server add, etc.
      </p>
      <p>
        All of those abilities are provided by the client inner API service (IPC), waiting for some periods to open more API.
      </p>
    </div>
  )
};

export default function WorkflowHelpInfo() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const styles = useStylesOfWorkflow();
  const lang = i18n.language;

  const currentTypography = {
    'en-US': <InstrunctionEnUs />,
    'zh-CN': <InstrunctionZhCn />,
    'ru-RU': <InstrunctionRuRu />,
  }[lang] || <InstrunctionEnUs />;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'help-popover' : undefined;

  return (
    <div>
      <IconButton size="small" onClick={handleClick}>
        <HelpOutlinedIcon className={`${styles.headerActionButton}`} aria-describedby={id} color="action" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        { currentTypography }
      </Popover>
    </div>
  );
}
