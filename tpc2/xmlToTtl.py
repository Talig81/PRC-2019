import xml.etree.ElementTree as ET

tree = ET.parse('arquivoSonor.xml')
root = tree.getroot()

# all items data
f = open("populated.txt", "w")

for obra in root:
    f.write(":" + obra.attrib["id"] + " rdf:type owl:NamedIndividual ,\n :Obra ;\n ")
    for obraElem in obra:
        if(obraElem.tag == "titulo"):
            f.write(":titulo " + "\"" + obraElem.text+ "\";\n" )
        if(obraElem.tag == "tipo"):
            f.write(":tipo " + "\"" + obraElem.text+ "\";\n" )
        if(obraElem.tag == "compositor"):
            f.write(":compositor " + "\"" + obraElem.text+ "\".\n" )
        if(obraElem.tag=="instrumentos"):
            for partituraObra in obraElem:
                for i in partituraObra:
                   if(i.tag == "designacao"):
                       f.write(":" + obra.attrib["id"] + " rdf:type owl:NamedIndividual ,\n :Obra ;\n ")

    f.write("\n")      
            
f.close()
    
     