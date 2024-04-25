from django.shortcuts import render
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import xml.etree.ElementTree as ET

import json

URL = "https://webdav.grid.surfsara.nl:2880"

headers = {
    "Authorization": TOKEN,
}

def home(req):
    return render(req, "index.html")


# API VIEWS
class DCacheDirView(APIView):
    def get(self, request, cwd="", *args, **kwargs):
        if cwd != "":
            cwd = "/" + cwd
        headers["Depth"] = "1"
        headers["Content-Type"] = 'application/xml'
        body = '''
        <?xml version="1.0" encoding="utf-8" ?>
        <D:propfind xmlns:D="DAV:">
            <D:prop>
                <D:displayname />
                <D:resourcetype />
            </D:prop>
        </D:propfind>
        '''
        response = requests.request("PROPFIND", URL + cwd, headers=headers, data=body)
        tree = ET.fromstring(response.content)
        namespace = {'d': 'DAV:'}  # Namespace for parsing

        # Extract the display name for each element in the directory
        files = []
        for response in tree.findall(".//d:response", namespaces=namespace):
            name = response.find(".//d:displayname", namespaces=namespace)
            resource_type = response.find(".//d:resourcetype", namespaces=namespace)
            is_dir = resource_type.find(".//d:collection", namespaces=namespace) != None
            files.append({
                "name": name.text,
                "is_dir": is_dir
            })
        data = {
            "files": files
        }
        return Response(status=200, data=data)
    
    def put(self, request, cwd="", *args, **kwargs):
        if cwd != "":
            cwd = "/" + cwd
        resp = requests.request("MKCOL", URL + cwd, headers=headers)
        return Response(None, resp.status_code)
    

class DCacheFileView(APIView):
    def get(self, request, path, *args, **kwargs):
        file = requests.get(URL + "/" + path, headers=headers, stream=True)
        name = path.split("/")[-1]
        print(file.raw)
        response = FileResponse(file.raw, as_attachment=True, filename=name)
        return response
    
    def delete(self, request, path, *args, **kwargs):
        response = requests.delete(URL + "/" + path, headers=headers, stream=True)
        if response.status_code == 200:
            return Response(None, 200)
        else:
            return Response(None, 500)
        
    def put(self, request, path, *args, **kwargs):
        file = request.FILES.get("file")
        resp = requests.put(URL + "/" + path, data=file.read(), headers=headers)
        return Response(None, resp.status_code)
        
        