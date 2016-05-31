import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Animated,
  Easing,
  View,
} from 'react-native';

const ANIMATED_EASING_PREFIXES = ['easeInOut', 'easeOut', 'easeIn'];

// For some reason 0 heights won't hide overflow in RN 0.12+
const ALMOST_ZERO = 0.00000001;

class Collapsible extends Component {
  static propTypes = {
    align: PropTypes.oneOf(['top', 'center', 'bottom']),
    collapsed: PropTypes.bool,
    duration: PropTypes.number,
    easing: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    style: View.propTypes.style,
  };

  static defaultProps = {
    align: 'top',
    collapsed: true,
    duration: 300,
    easing: 'easeOutCubic',
  };

  componentWillReceiveProps(props) {
    if (props.collapsed !== this.props.collapsed) {
      this._toggleCollapsed(props.collapsed);
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      height: ALMOST_ZERO,
      contentHeight: 0,
      animating: false,
    };
  }

  _toggleCollapsed(collapsed) {
    const height = collapsed ? ALMOST_ZERO : this.state.contentHeight;
    this.setState({ height });
  }

  _handleLayoutChange(event) {
    const contentHeight = event.nativeEvent.layout.height;
    const height = this.props.collapsed ? ALMOST_ZERO : contentHeight;
    this.setState({
      height: height,
      contentHeight,
    });
  }

  render() {
    const { height, contentHeight } = this.state;
    const style = {
      overflow: 'hidden',
      height: height,
    };
    let contentStyle = {};
    if (this.props.align === 'center') {
      contentStyle.transform = [{
        translateY: height.interpolate({
          inputRange: [0, contentHeight],
          outputRange: [contentHeight / -2, 0],
        }),
      }];
    } else if (this.props.align === 'bottom') {
      contentStyle.transform = [{
        translateY: height.interpolate({
          inputRange: [0, contentHeight],
          outputRange: [-contentHeight, 0],
        }),
      }];
    }
    return (
      <View style={style} pointerEvents={this.props.collapsed ? 'none' : 'auto'}>
        <View style={[this.props.style, contentStyle]} onLayout={this.state.animating ? undefined : event => this._handleLayoutChange(event)}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

module.exports = Collapsible;
