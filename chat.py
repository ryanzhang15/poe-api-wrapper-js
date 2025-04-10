try:
    from poe_api_wrapper import PoeExample
except:
    import pip
    pip.main(['install', 'poe_api_wrapper'])
    from poe_api_wrapper import PoeExample

tokens = {
    'p-b': "pY4rX6JmE3eHOEiRhIFkBA==", 
    'p-lat': "xMLCZVQln5S2bWb/xnL4zTqMHAM95vebBVXOdqBbhg==",
}

PoeExample(tokens=tokens).chat_with_bot()
 