import React from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';

import Modal from "react-native-modal";
import Pdf from 'react-native-pdf';
import { createStackNavigator, NavigationActions } from 'react-navigation';
import QRCode from 'react-native-qrcode-svg';
import { PagerTabIndicator, IndicatorViewPager } from 'rn-viewpager';

const numbers = Array(500).fill().map((v,i) => i);

class Button extends React.Component {
  render() {
    return (
      <TouchableOpacity style={styles.button} onPress={this.props.onPress}>
        <Text>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

class Delay extends React.Component {
  static defaultProps = {
    wait: 250,
  };

  state = {
    waiting: true,
  };

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({
        waiting: false
      });
    }, this.props.wait);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    if (!this.state.waiting) {
      return this.props.children;
    }

    return null;
  }
}

const colors = ['black', 'blue', 'yellow', 'white', 'green', 'red', 'purple', 'pink'];
const gridSize = Dimensions.get('window').width / 10;

class GridScreen extends React.Component {
  static navigationOptions = {
    title: 'Raster',
  }

  render() {
    return (
      <ScrollView>
        <View style={{flex: 1, flexWrap: 'wrap', flexDirection: 'row'}}>
          {numbers.map((i) =>{
            return (
              <View key={i} style={{alignItems: 'center', justifyContent: 'center', width: gridSize, height: gridSize, backgroundColor: colors[Math.floor(Math.random() * colors.length)]}}>
                <Text>{i}</Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    );
  }
}

class PDFScreen extends React.Component {
  static navigationOptions = {
    title: 'PDFs',
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  renderTabIndicator() {
    let tabs = [{
          text: 'PDF 1',
      },{
          text: 'PDF 2',
      },{
          text: 'PDF 3',
      }];

    return <PagerTabIndicator tabs={tabs}/>;
  }

  render() {
    return (
      <IndicatorViewPager
          style={{flex:1, paddingTop:20, backgroundColor:'white'}}
          indicator={this.renderTabIndicator()}>
          <View>
            <Pdf
              source={{ uri: 'https://smorder.at/ausee3/Rider_info.pdf' }}
              style={styles.pdf} />
          </View>
          <View>
            <Pdf
              source={{ uri: 'https://www.thalhammers.at/wp-content/uploads/2018/08/Mittagsbuffet.pdf' }}
              style={styles.pdf} />
          </View>
          <View>
            <Pdf
              source={{ uri: 'https://www.thomsn.at/wcms/Clients/501485728561537/Documents/31/Speisekarte_WS2017_2018_WEB.pdf' }}
              style={styles.pdf} />
          </View>
      </IndicatorViewPager>
    );
  }
}

const mapMenu = (menu) =>{
  let menuEntries = [];

  for (const m of menu) {
    for (const c of m.categories) {
      menuEntries = menuEntries.concat(c.menuEntries)
    }
  }

  return menuEntries;
}

class ListScreen extends React.Component {
  static navigationOptions = {
    title: 'Liste',
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      entries: []
    };

    this.navigate = this.navigate.bind(this)
    this.renderItem = this.renderItem.bind(this)
  }

  componentWillMount(){
    this.loadData();
  }

  navigate(routeName){
    const navigateAction = NavigationActions.navigate({
      routeName,
      params: {},
      key: Math.random()
    });

    this.props.navigation.dispatch(navigateAction);
  }

  loadData(){
    this.setState({ loading: true })

    fetch('https://my.smorder.at/api/v1/locations/7/menus')
      .then((response) => response.json())
      .then(mapMenu)
      .then(entries => this.setState({ entries, loading: false }));
  }

  renderItem({item}){
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => this.navigate('List2')}>
          <View style={styles.imageSize}>
            <Delay>
              <QRCode value={item.name} size={50} />
            </Delay>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.navigate('PDF')}>
          <Image
            style={styles.imageSize}
            resizeMode={'contain'}
            source={{
              uri: 'https://picsum.photos/50/50/?random&cacheBust=' + item.menuEntryID,
              headers: {
                Pragma: 'no-cache',
              }}
            } />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.navigate('Inception')}>
          <View style={styles.rowContent}>
            <Text>{item.name} ({item.price}€)</Text>
            <Text>{item.subtitle}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    if(this.state.loading){
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Lade...</Text>
        </View>
      )
    }

    return (
      <FlatList
        keyExtractor={(item) => `${item.menuEntryID}`}
        initialNumToRender={10}
        windowSize={20}
        maxToRenderPerBatch={15}
        data={this.state.entries}
        renderItem={this.renderItem}
      />
    );
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
  }

  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      animatedValue: new Animated.Value(0)
    };

    this.closeModal = this.closeModal.bind(this)
  }

  navigate(routeName){
    const navigateAction = NavigationActions.navigate({
      routeName,
      params: {},
      key: Math.random()
    });

    this.props.navigation.dispatch(navigateAction);
  }

  closeModal(){
    this.setState({ modalVisible: false })
  }

  componentDidMount(){
    this.animationLoop();
  }

  animationLoop() {
    Animated.sequence([
      Animated.timing(this.state.animatedValue, {
        toValue: 1,
        duration: 500,
        delay: 1000
      }),
      Animated.timing(this.state.animatedValue, {
        toValue: 0,
        duration: 500,
        delay: 2000
      })
    ]).start(() => {
      this.animationLoop();
    });
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Image source={{ uri: 'https://www.apro.at/img/logo.png' }} style={[styles.logo, {
          transform: [
            { rotate: this.state.animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            },
          ],
        }]} resizeMode={'contain'} />
        <View>
          <Button text={'Liste'} onPress={() => this.navigate('List')}/>
        </View>
        <View>
          <Button text={'Raster'} onPress={() => this.navigate('Grid')}/>
        </View>
        <View>
          <Button text={'PDF'} onPress={() => this.navigate('PDF')}/>
        </View>
        <View>
          <Button text={'Inception'} onPress={() => this.navigate('Inception')}/>
        </View>
        <View>
          <Button text={'Modal'} onPress={() => this.setState({ modalVisible: true })}/>
        </View>
        <Modal
          animationType="slide"
          backdropColor={'black'}
          onBackdropPress={this.closeModal}
          visible={this.state.modalVisible}
          onRequestClose={this.closeModal}>
          <View style={styles.modalContent}>
            <ListScreen navigation={this.props.navigation }/>
            <Button text={'Zurück'} onPress={this.closeModal} />
          </View>
        </Modal>
      </View>
    );
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    PDF: PDFScreen,
    List: ListScreen,
    List2: ListScreen,
    Inception: HomeScreen,
    Grid: GridScreen,
  },
  {
    initialRouteName: 'Home',
  }
);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 50,
    backgroundColor: '#B0CB1F',
    borderRadius: 5,
    margin: 10
  },
  pdf: {
    flex:1,
    width: Dimensions.get('window').width,
  },
  logo: {
    width: 300,
    height: 200,
    padding: 30,
    tintColor: 'black'
  },
  modalContent: {
    margin: 30,
    backgroundColor: '#cccccccc'
  },
  imageSize: {
    width: 50,
    height: 50
  },
  rowContent: {
    flexDirection: 'column',
    padding: 10
  },
  item: {
    padding: 10,
    flexDirection: 'row'
  }
});
