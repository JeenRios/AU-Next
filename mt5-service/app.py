"""
MT5 Trading Service
Flask API that connects to MetaTrader 5 terminal for trading operations.

Requirements:
- Windows OS with MT5 terminal installed
- MT5 terminal must be running
- Python with MetaTrader5 package

Run: python app.py
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','))

# API Key for authentication
API_KEY = os.getenv('MT5_SERVICE_API_KEY', 'mt5-service-secret-key')

# Store active connections
active_connections = {}

def require_api_key(f):
    """Decorator to require API key authentication"""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != API_KEY:
            return jsonify({'success': False, 'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated


def get_mt5():
    """Import MetaTrader5 module"""
    try:
        import MetaTrader5 as mt5
        return mt5
    except ImportError:
        return None


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    mt5 = get_mt5()
    return jsonify({
        'success': True,
        'status': 'running',
        'mt5_available': mt5 is not None,
        'active_connections': len(active_connections),
        'timestamp': datetime.now().isoformat()
    })


@app.route('/initialize', methods=['POST'])
@require_api_key
def initialize():
    """Initialize MT5 terminal connection"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    data = request.json or {}
    path = data.get('path')  # Optional: path to MT5 terminal

    try:
        if path:
            initialized = mt5.initialize(path)
        else:
            initialized = mt5.initialize()

        if not initialized:
            error = mt5.last_error()
            return jsonify({
                'success': False,
                'error': f'MT5 initialization failed: {error}'
            }), 500

        terminal_info = mt5.terminal_info()
        return jsonify({
            'success': True,
            'message': 'MT5 initialized successfully',
            'terminal': {
                'connected': terminal_info.connected if terminal_info else False,
                'trade_allowed': terminal_info.trade_allowed if terminal_info else False,
                'name': terminal_info.name if terminal_info else None,
                'path': terminal_info.path if terminal_info else None,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/login', methods=['POST'])
@require_api_key
def login():
    """Login to MT5 account"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    data = request.json
    if not data:
        return jsonify({'success': False, 'error': 'Request body required'}), 400

    account = data.get('account')
    password = data.get('password')
    server = data.get('server')

    if not all([account, password, server]):
        return jsonify({'success': False, 'error': 'account, password, and server are required'}), 400

    try:
        # Ensure MT5 is initialized
        if not mt5.initialize():
            return jsonify({'success': False, 'error': 'Failed to initialize MT5'}), 500

        # Login to account
        authorized = mt5.login(int(account), password=password, server=server)

        if not authorized:
            error = mt5.last_error()
            return jsonify({
                'success': False,
                'error': f'Login failed: {error}'
            }), 401

        # Get account info
        account_info = mt5.account_info()
        if account_info is None:
            return jsonify({'success': False, 'error': 'Failed to get account info'}), 500

        # Store connection
        connection_id = f"{account}@{server}"
        active_connections[connection_id] = {
            'account': account,
            'server': server,
            'login_time': datetime.now().isoformat()
        }

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'connection_id': connection_id,
            'account': {
                'login': account_info.login,
                'name': account_info.name,
                'server': account_info.server,
                'currency': account_info.currency,
                'balance': account_info.balance,
                'equity': account_info.equity,
                'margin': account_info.margin,
                'margin_free': account_info.margin_free,
                'margin_level': account_info.margin_level,
                'profit': account_info.profit,
                'leverage': account_info.leverage,
                'trade_allowed': account_info.trade_allowed,
                'trade_expert': account_info.trade_expert,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/account', methods=['GET'])
@require_api_key
def get_account():
    """Get current account information"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    try:
        account_info = mt5.account_info()
        if account_info is None:
            return jsonify({'success': False, 'error': 'Not logged in or failed to get account info'}), 401

        return jsonify({
            'success': True,
            'account': {
                'login': account_info.login,
                'name': account_info.name,
                'server': account_info.server,
                'currency': account_info.currency,
                'balance': account_info.balance,
                'equity': account_info.equity,
                'margin': account_info.margin,
                'margin_free': account_info.margin_free,
                'margin_level': account_info.margin_level,
                'profit': account_info.profit,
                'leverage': account_info.leverage,
                'trade_allowed': account_info.trade_allowed,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/positions', methods=['GET'])
@require_api_key
def get_positions():
    """Get open positions"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    try:
        positions = mt5.positions_get()
        if positions is None:
            return jsonify({'success': True, 'positions': []})

        positions_list = []
        for pos in positions:
            positions_list.append({
                'ticket': pos.ticket,
                'symbol': pos.symbol,
                'type': 'buy' if pos.type == 0 else 'sell',
                'volume': pos.volume,
                'price_open': pos.price_open,
                'price_current': pos.price_current,
                'sl': pos.sl,
                'tp': pos.tp,
                'profit': pos.profit,
                'swap': pos.swap,
                'time': datetime.fromtimestamp(pos.time).isoformat(),
                'magic': pos.magic,
                'comment': pos.comment,
            })

        return jsonify({
            'success': True,
            'positions': positions_list,
            'count': len(positions_list)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/orders', methods=['GET'])
@require_api_key
def get_orders():
    """Get pending orders"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    try:
        orders = mt5.orders_get()
        if orders is None:
            return jsonify({'success': True, 'orders': []})

        orders_list = []
        for order in orders:
            orders_list.append({
                'ticket': order.ticket,
                'symbol': order.symbol,
                'type': order.type,
                'volume': order.volume_current,
                'price_open': order.price_open,
                'sl': order.sl,
                'tp': order.tp,
                'time_setup': datetime.fromtimestamp(order.time_setup).isoformat(),
                'magic': order.magic,
                'comment': order.comment,
            })

        return jsonify({
            'success': True,
            'orders': orders_list,
            'count': len(orders_list)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/history', methods=['GET'])
@require_api_key
def get_history():
    """Get trade history"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    try:
        # Get deals from the last 30 days
        from datetime import timedelta
        date_from = datetime.now() - timedelta(days=30)
        date_to = datetime.now()

        deals = mt5.history_deals_get(date_from, date_to)
        if deals is None:
            return jsonify({'success': True, 'deals': []})

        deals_list = []
        for deal in deals:
            deals_list.append({
                'ticket': deal.ticket,
                'order': deal.order,
                'symbol': deal.symbol,
                'type': deal.type,
                'volume': deal.volume,
                'price': deal.price,
                'profit': deal.profit,
                'swap': deal.swap,
                'commission': deal.commission,
                'time': datetime.fromtimestamp(deal.time).isoformat(),
                'magic': deal.magic,
                'comment': deal.comment,
            })

        return jsonify({
            'success': True,
            'deals': deals_list,
            'count': len(deals_list)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/trade/open', methods=['POST'])
@require_api_key
def open_trade():
    """Open a new trade"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    data = request.json
    if not data:
        return jsonify({'success': False, 'error': 'Request body required'}), 400

    symbol = data.get('symbol')
    order_type = data.get('type', 'buy').lower()
    volume = float(data.get('volume', 0.01))
    sl = data.get('sl')
    tp = data.get('tp')
    comment = data.get('comment', 'AU-Next Trade')
    magic = data.get('magic', 123456)

    if not symbol:
        return jsonify({'success': False, 'error': 'symbol is required'}), 400

    try:
        # Get symbol info
        symbol_info = mt5.symbol_info(symbol)
        if symbol_info is None:
            return jsonify({'success': False, 'error': f'Symbol {symbol} not found'}), 400

        if not symbol_info.visible:
            if not mt5.symbol_select(symbol, True):
                return jsonify({'success': False, 'error': f'Failed to select symbol {symbol}'}), 400

        # Get current price
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return jsonify({'success': False, 'error': 'Failed to get price'}), 500

        # Determine order type and price
        if order_type == 'buy':
            trade_type = mt5.ORDER_TYPE_BUY
            price = tick.ask
        else:
            trade_type = mt5.ORDER_TYPE_SELL
            price = tick.bid

        # Prepare request
        request_dict = {
            'action': mt5.TRADE_ACTION_DEAL,
            'symbol': symbol,
            'volume': volume,
            'type': trade_type,
            'price': price,
            'deviation': 20,
            'magic': magic,
            'comment': comment,
            'type_time': mt5.ORDER_TIME_GTC,
            'type_filling': mt5.ORDER_FILLING_IOC,
        }

        if sl:
            request_dict['sl'] = float(sl)
        if tp:
            request_dict['tp'] = float(tp)

        # Send order
        result = mt5.order_send(request_dict)

        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return jsonify({
                'success': False,
                'error': f'Trade failed: {result.comment}',
                'retcode': result.retcode
            }), 400

        return jsonify({
            'success': True,
            'message': 'Trade opened successfully',
            'order': {
                'ticket': result.order,
                'deal': result.deal,
                'volume': result.volume,
                'price': result.price,
                'symbol': symbol,
                'type': order_type,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/trade/close', methods=['POST'])
@require_api_key
def close_trade():
    """Close an open position"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    data = request.json
    if not data:
        return jsonify({'success': False, 'error': 'Request body required'}), 400

    ticket = data.get('ticket')
    if not ticket:
        return jsonify({'success': False, 'error': 'ticket is required'}), 400

    try:
        # Get position info
        position = mt5.positions_get(ticket=int(ticket))
        if not position:
            return jsonify({'success': False, 'error': f'Position {ticket} not found'}), 404

        position = position[0]
        symbol = position.symbol
        volume = position.volume
        pos_type = position.type

        # Get current price
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return jsonify({'success': False, 'error': 'Failed to get price'}), 500

        # Opposite trade to close
        if pos_type == 0:  # Buy position
            trade_type = mt5.ORDER_TYPE_SELL
            price = tick.bid
        else:  # Sell position
            trade_type = mt5.ORDER_TYPE_BUY
            price = tick.ask

        # Prepare close request
        request_dict = {
            'action': mt5.TRADE_ACTION_DEAL,
            'symbol': symbol,
            'volume': volume,
            'type': trade_type,
            'position': int(ticket),
            'price': price,
            'deviation': 20,
            'magic': 123456,
            'comment': 'AU-Next Close',
            'type_time': mt5.ORDER_TIME_GTC,
            'type_filling': mt5.ORDER_FILLING_IOC,
        }

        result = mt5.order_send(request_dict)

        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return jsonify({
                'success': False,
                'error': f'Close failed: {result.comment}',
                'retcode': result.retcode
            }), 400

        return jsonify({
            'success': True,
            'message': 'Position closed successfully',
            'order': {
                'ticket': result.order,
                'deal': result.deal,
                'volume': result.volume,
                'price': result.price,
                'profit': position.profit,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/trade/modify', methods=['POST'])
@require_api_key
def modify_trade():
    """Modify SL/TP of an open position"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    data = request.json
    if not data:
        return jsonify({'success': False, 'error': 'Request body required'}), 400

    ticket = data.get('ticket')
    sl = data.get('sl')
    tp = data.get('tp')

    if not ticket:
        return jsonify({'success': False, 'error': 'ticket is required'}), 400

    if sl is None and tp is None:
        return jsonify({'success': False, 'error': 'sl or tp is required'}), 400

    try:
        # Get position info
        position = mt5.positions_get(ticket=int(ticket))
        if not position:
            return jsonify({'success': False, 'error': f'Position {ticket} not found'}), 404

        position = position[0]

        # Prepare modify request
        request_dict = {
            'action': mt5.TRADE_ACTION_SLTP,
            'symbol': position.symbol,
            'position': int(ticket),
            'sl': float(sl) if sl is not None else position.sl,
            'tp': float(tp) if tp is not None else position.tp,
        }

        result = mt5.order_send(request_dict)

        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return jsonify({
                'success': False,
                'error': f'Modify failed: {result.comment}',
                'retcode': result.retcode
            }), 400

        return jsonify({
            'success': True,
            'message': 'Position modified successfully',
            'sl': request_dict['sl'],
            'tp': request_dict['tp'],
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/symbols', methods=['GET'])
@require_api_key
def get_symbols():
    """Get available symbols"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    try:
        symbols = mt5.symbols_get()
        if symbols is None:
            return jsonify({'success': True, 'symbols': []})

        # Get only visible symbols
        visible_symbols = [s for s in symbols if s.visible]

        symbols_list = []
        for s in visible_symbols[:100]:  # Limit to 100
            symbols_list.append({
                'name': s.name,
                'description': s.description,
                'currency_base': s.currency_base,
                'currency_profit': s.currency_profit,
                'digits': s.digits,
                'trade_mode': s.trade_mode,
            })

        return jsonify({
            'success': True,
            'symbols': symbols_list,
            'count': len(symbols_list)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/account/extended', methods=['POST'])
@require_api_key
def get_account_extended():
    """Get extended account information including positions summary"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    data = request.json or {}
    account = data.get('account')
    server = data.get('server')

    try:
        # If account/server provided, check if we need to login
        # (For production, credentials should be stored securely and reused)

        account_info = mt5.account_info()
        if account_info is None:
            return jsonify({'success': False, 'error': 'Not logged in or failed to get account info'}), 401

        # Get positions for extended stats
        positions = mt5.positions_get()
        positions_list = positions if positions else []

        # Calculate totals
        total_lot_size = sum(pos.volume for pos in positions_list) if positions_list else 0
        total_profit = sum(pos.profit for pos in positions_list) if positions_list else 0
        open_positions_count = len(positions_list)

        # Build extended positions list
        positions_data = []
        for pos in positions_list:
            positions_data.append({
                'ticket': pos.ticket,
                'symbol': pos.symbol,
                'type': 'buy' if pos.type == 0 else 'sell',
                'volume': pos.volume,
                'price_open': pos.price_open,
                'price_current': pos.price_current,
                'sl': pos.sl,
                'tp': pos.tp,
                'profit': pos.profit,
                'swap': pos.swap,
                'time': datetime.fromtimestamp(pos.time).isoformat(),
                'magic': pos.magic,
                'comment': pos.comment,
            })

        return jsonify({
            'success': True,
            'login': account_info.login,
            'name': account_info.name,
            'server': account_info.server,
            'currency': account_info.currency,
            'balance': account_info.balance,
            'equity': account_info.equity,
            'margin': account_info.margin,
            'margin_free': account_info.margin_free,
            'margin_level': account_info.margin_level,
            'profit': account_info.profit,
            'leverage': account_info.leverage,
            'trade_allowed': account_info.trade_allowed,
            'trade_expert': account_info.trade_expert,
            # Extended data
            'open_positions_count': open_positions_count,
            'total_lot_size': total_lot_size,
            'positions_profit': total_profit,
            'positions': positions_data,
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/ea/status', methods=['POST'])
@require_api_key
def get_ea_status():
    """Check EA status by checking trade_expert flag and positions with magic number"""
    mt5 = get_mt5()
    if not mt5:
        return jsonify({'success': False, 'error': 'MetaTrader5 module not installed'}), 500

    data = request.json or {}
    magic_number = data.get('magic', 123456)  # Default AU-Next EA magic number

    try:
        account_info = mt5.account_info()
        if account_info is None:
            return jsonify({'success': False, 'error': 'Not logged in or failed to get account info'}), 401

        # Check if expert advisors are allowed
        trade_expert_allowed = account_info.trade_expert

        # Get positions opened by EA (with magic number)
        positions = mt5.positions_get()
        positions_list = positions if positions else []

        # Filter positions by magic number (EA positions)
        ea_positions = [pos for pos in positions_list if pos.magic == magic_number]
        ea_positions_count = len(ea_positions)
        ea_total_volume = sum(pos.volume for pos in ea_positions) if ea_positions else 0
        ea_total_profit = sum(pos.profit for pos in ea_positions) if ea_positions else 0

        # EA is considered active if:
        # 1. trade_expert is allowed AND
        # 2. There are positions with the EA's magic number OR
        #    The last trade was recent (within last hour)
        ea_active = trade_expert_allowed and ea_positions_count > 0

        # Get recent deals to check EA activity
        from datetime import timedelta
        date_from = datetime.now() - timedelta(hours=1)
        date_to = datetime.now()
        recent_deals = mt5.history_deals_get(date_from, date_to)

        ea_recent_trades = 0
        if recent_deals:
            ea_recent_trades = sum(1 for d in recent_deals if d.magic == magic_number)

        return jsonify({
            'success': True,
            'ea_active': ea_active or ea_recent_trades > 0,
            'trade_expert_allowed': trade_expert_allowed,
            'ea_positions_count': ea_positions_count,
            'ea_total_volume': ea_total_volume,
            'ea_total_profit': ea_total_profit,
            'ea_recent_trades': ea_recent_trades,
            'magic_number': magic_number,
            'ea_positions': [{
                'ticket': pos.ticket,
                'symbol': pos.symbol,
                'type': 'buy' if pos.type == 0 else 'sell',
                'volume': pos.volume,
                'profit': pos.profit,
            } for pos in ea_positions]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/shutdown', methods=['POST'])
@require_api_key
def shutdown():
    """Shutdown MT5 connection"""
    mt5 = get_mt5()
    if mt5:
        mt5.shutdown()
        active_connections.clear()

    return jsonify({
        'success': True,
        'message': 'MT5 connection closed'
    })


if __name__ == '__main__':
    port = int(os.getenv('MT5_SERVICE_PORT', 5000))
    debug = os.getenv('MT5_SERVICE_DEBUG', 'false').lower() == 'true'

    print(f"""
╔══════════════════════════════════════════════════════════╗
║            MT5 Trading Service Starting                  ║
╠══════════════════════════════════════════════════════════╣
║  Port: {port}                                              ║
║  Debug: {debug}                                            ║
║                                                          ║
║  Endpoints:                                              ║
║    GET  /health           - Health check                 ║
║    POST /initialize       - Initialize MT5               ║
║    POST /login            - Login to account             ║
║    GET  /account          - Get account info             ║
║    POST /account/extended - Extended account info        ║
║    GET  /positions        - Get open positions           ║
║    GET  /orders           - Get pending orders           ║
║    GET  /history          - Get trade history            ║
║    POST /trade/open       - Open new trade               ║
║    POST /trade/close      - Close position               ║
║    POST /trade/modify     - Modify SL/TP                 ║
║    GET  /symbols          - Get available symbols        ║
║    POST /ea/status        - Check EA status              ║
║    POST /shutdown         - Shutdown MT5                 ║
╚══════════════════════════════════════════════════════════╝
    """)

    app.run(host='0.0.0.0', port=port, debug=debug)
