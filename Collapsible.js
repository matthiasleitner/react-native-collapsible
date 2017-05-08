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

class Collapsible extends Component {
  static propTypes = {
    align: PropTypes.oneOf(['top', 'center', 'bottom']),
    collapsed: PropTypes.bool,
    collapsedHeight: PropTypes.number,
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
    collapsedHeight: 0,
    duration: 300,
    easing: 'easeOutCubic',
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.collapsed !== this.props.collapsed) {
      this._toggleCollapsed(nextProps.collapsed);
    } else if (nextProps.collapsed && nextProps.collapsedHeight !== this.props.collapsedHeight) {
      this.state.height.setValue(nextProps.collapsedHeight);
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      measuring: false,
      measured: false,
      contentHeight: 0,
      animating: false,
    };
  }

  contentHandle = null;

  _handleRef = (ref) => {
    this.contentHandle = ref;
  }

  _measureContent(callback) {
    this.setState({
      measuring: true,
    }, () => {
      requestAnimationFrame(() => {
        if (!this.contentHandle) {
          this.setState({
            measuring: false,
          }, () => callback(this.props.collapsedHeight));
        } else {
          this.contentHandle.getNode().measure((x, y, width, height) => {
            this.setState({
              measuring: false,
              measured: true,
              contentHeight: height,
            }, () => callback(height));
          });
        }
      });
    });
  }

  _toggleCollapsed(collapsed) {

    if (collapsed) {
      this._transitionToHeight(this.props.collapsedHeight)
    } else if (!this.contentHandle) {
      if (this.state.measured) {
      this._transitionToHeight(this.state.contentHeight)
      }
      return;
    } else {
      this._measureContent(contentHeight => {
        this._transitionToHeight(contentHeight);
      })
    }
  }

  _transitionToHeight(height) {

    this.setState({ height, animating: false  });
  }

  _handleLayoutChange = (event) => {
    const contentHeight = event.nativeEvent.layout.height;
    if (this.state.animating || this.props.collapsed || this.state.measuring || this.state.contentHeight === contentHeight) {
      return;
    }
    this.state.height.setValue(contentHeight);
    this.setState({ contentHeight });
  };


  render() {
    const { collapsed } = this.props;
    const { height, contentHeight, measuring, measured } = this.state;
    const hasKnownHeight = !measuring && (measured || collapsed);
    const style = hasKnownHeight && {
      overflow: 'hidden',
      height: height,
    };
    const contentStyle = {};
    if (measuring) {
      contentStyle.position = 'absolute',
      contentStyle.opacity = 0;
    } else if (this.props.align === 'center') {
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
      <View
        style={style}
        pointerEvents={collapsed ? 'none' : 'auto'}
      >
        <View
          ref={this._handleRef}
          style={[this.props.style, contentStyle]}
          onLayout={this.state.animating ? undefined : this._handleLayoutChange}
        >
          {this.props.children}
        </View>
      </View>
    );
  }
}

module.exports = Collapsible;
