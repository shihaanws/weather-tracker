import { Typography } from "antd";
import React from "react";

const { Text } = Typography;

function Footer() {
  return (
    <div>
      <footer class="bg-white h-10 mt-12 mb-0 flex items-center text-center justify-center rounded-lg  dark:bg-gray-900 ">
        <Text class=" text-sm space-grotesk-title text-gray-500 sm:text-center dark:text-gray-400">
          Made with ❤️ by Shihaan
        </Text>
      </footer>
    </div>
  );
}

export default Footer;
