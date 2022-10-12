<template>
  <nav>
    <ul>
      <li><router-link to="/">タイムライン設定</router-link></li>
      <li><router-link to="/about">オーバーレイ設定</router-link></li>
    </ul>
  </nav>
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 0px;
}

ul {
  display: table;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  text-align: center;
}
ul li {
  display: table-cell;
  width: 100px;
}
ul li a {
  display: block;
  width: 100%;
  padding: 10px 0;
  text-decoration: none;
  color: #555;
  font-weight: bold;

  &.router-link-exact-active {
    background-color: #deebf7;
  }
}
ul li:hover {
  background-color: #fff2cc;
}
</style>
